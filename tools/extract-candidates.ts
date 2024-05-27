import ExcelJS from 'exceljs';
import fs from 'fs';
import Ajv from "ajv/dist/jtd"
import { JTDDataType } from 'ajv/dist/core';
import { groupBy, normalize } from './utils';
// @ts-ignore
import countyCodes from '../../src/files/counties.json';

const ajv = new Ajv();

enum CandidateType {
  Person = 'person',
  Party = 'party',
}

enum CandidateScope {
  Country = 'COUNTRY',
  County = 'COUNTY',
  Locality = 'LOCALITY',
}

interface Poll {
  /** Resulted poll ID in the JSON file */
  id: string;
  /** Values that will be used to find the rows of this poll */
  cellValues: string[];
  /** The scope of the candidates in this poll */
  candidateScope: CandidateScope;
  candidateType: CandidateType;
}

interface Candidate {
  candidate: string;
  party?: string;
}

export type CandidatesFile =
  Record<Poll['id'], {
    [CandidateScope.Country]: Candidate[];
    [CandidateScope.County]: Record<string, Candidate[]>;
    [CandidateScope.Locality]: Record<string, Record<string, Candidate[]>>;
  }>;

const extractionSchema = {
  properties: {
    inputFile: { type: 'string' },
    outputFile: { type: 'string' },
    independentColumnValue: { type: 'string' },
    polls: {
      elements: {
        properties: {
          id: { type: 'string' },
          cellValues: { elements: { type: 'string' } },
          candidateScope: { enum: Object.values(CandidateScope) },
          candidateType: { enum: Object.values(CandidateType) },
        },
      }
    },
    columns: {
      properties: {
        poll: { type: 'uint32' },
        ballotPosition: { type: 'uint32' },
        party: { type: 'uint32' },
        candidateName1: { type: 'uint32' },
        candidateName2: { type: 'uint32' },
      },
      optionalProperties: {
        county: { type: 'uint32' },
        uatName: { type: 'uint32' },
      },
    },
  }
} as const;

type ExtractionSchema = JTDDataType<typeof extractionSchema>;

const validateSchema = ajv.compile<ExtractionSchema>(extractionSchema);

async function main() {
  const schemaFile = process.argv[2];
  const schema: ExtractionSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf-8'));
  if(!validateSchema(schema)) {
    console.error('Provided schema is invalid.');
    console.error(JSON.stringify(validateSchema.errors, null, 2));
    return;
  }
  if(schema.polls.some(poll => poll.candidateScope === CandidateScope.County) && !schema.columns.county) {
    console.error('County scoped polls require a county column.');
    return;
  }
  if(schema.polls.some(poll => poll.candidateScope === CandidateScope.Locality) && (!schema.columns.uatName || !schema.columns.county)) {
    console.error('Locality scoped polls require a county and a locality column.');
    return;
  }
  const countyCodesReversed = Object.fromEntries(
    Object.entries(countyCodes).map(([key, value]) => [normalize(value as string), key])
  );
  function getCountyCode(county: string) {
    return countyCodesReversed[normalize(county)];
  }
  function getCandidates(rows: ExcelJS.Row[], poll: Poll) {
    function getCandidateName(row: ExcelJS.Row) {
      return [
        row.getCell(schema.columns.candidateName1).value?.toString(),
        schema.columns.candidateName2 ? row.getCell(schema.columns.candidateName2).value?.toString() : '',
      ].filter(Boolean).join(' ');
    }
    function getPartyName(row: ExcelJS.Row) {
      return row.getCell(schema.columns.party).value?.toString() || '';
    }
    const candidates: Candidate[] = [];
    let ballowPosition = 0;
    for (const row of rows) {
      const rowBallotPosition = Number(row.getCell(schema.columns.ballotPosition).value);
      if(Number.isNaN(rowBallotPosition)) {
        throw new Error('Invalid ballot position.');
      }
      if(rowBallotPosition === ballowPosition) {
        continue;
      }
      ballowPosition = rowBallotPosition;
      const isIndependent = getPartyName(row) === schema.independentColumnValue;
      let candidate: Candidate;
      if(poll.candidateType === CandidateType.Party) {
        candidate = {
          candidate: isIndependent ? getCandidateName(row) : getPartyName(row),
        };
      } else if(poll.candidateType === CandidateType.Person) {
        candidate = {
          candidate: getCandidateName(row),
          party: isIndependent ? undefined : getPartyName(row),
        };
      } else {
        throw new Error('Invalid candidate type.');
      }
      candidates.push(candidate);
    }
    return candidates;
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(schema.inputFile);
  const worksheet = workbook.worksheets[0];
  let result: CandidatesFile = {};
  for (const poll of schema.polls) {
    const rows = worksheet.getRows(1, worksheet.rowCount)!;
    const pollRows = rows.filter(row => poll.cellValues.includes(row.getCell(schema.columns.poll).value?.toString() || ''));
    result[poll.id] = {
      [CandidateScope.Country]: [],
      [CandidateScope.County]: {},
      [CandidateScope.Locality]: {},
    };
    if(poll.candidateScope === CandidateScope.Locality) {
      const groupedByCounty = groupBy(pollRows, row => row.getCell(schema.columns.county!).value?.toString() || '');
      for(const [county, countyRows] of Object.entries(groupedByCounty)) {
        const countyCode = getCountyCode(county);
        result[poll.id][CandidateScope.Locality][countyCode] = {};
        const groupedByLocality = groupBy(countyRows, row => row.getCell(schema.columns.uatName!).value?.toString() || '');
        for(const [locality, localityRows] of Object.entries(groupedByLocality)) {
          result[poll.id][CandidateScope.Locality][countyCode][locality] = getCandidates(localityRows, poll);
        }
      }
    } else if(poll.candidateScope === CandidateScope.County) {
      const groupedByCounty = groupBy(pollRows, row => row.getCell(schema.columns.county!).value?.toString() || '');
      for(const [county, countyRows] of Object.entries(groupedByCounty)) {
        const countyCode = getCountyCode(county);
        result[poll.id][CandidateScope.County][countyCode] = getCandidates(countyRows, poll);
      }
    } else if(poll.candidateScope === CandidateScope.Country) {
      result[poll.id][CandidateScope.Country] = getCandidates(pollRows, poll);
    } else {
      throw new Error('Invalid candidate scope');
    }
  }
  fs.writeFileSync(schema.outputFile, JSON.stringify(result, null, 2));
  console.log(`Extracted candidates to ${schema.outputFile}`);
}

main();
