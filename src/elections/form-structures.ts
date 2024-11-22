import { FieldMeaning, FormStructure } from "./types";

type FormGroupValue = Record<string, number>;

export interface ValidationError {
  type: 'error' | 'warning';
  constraint: string;
  message: string;
}

interface AssertConstraintOptions {
  key: string;
  constraint: string;
  error: {
    condition: (formGroupValue: FormGroupValue) => boolean;
    message: string;
  }
  warning?: {
    condition: (formGroupValue: FormGroupValue) => boolean;
    message: string;
  }
}

class Validator {

  private validationErrors: Record<string, ValidationError> = {};

  constructor(private formGroupValue: Record<string, number>) {}

  assertConstraint({ key, constraint, error, warning }: AssertConstraintOptions): void {
    const isError = error.condition(this.formGroupValue);
    const isWarning = warning && warning.condition(this.formGroupValue);
    if(isError || isWarning) {
      this.addRecord(key, constraint, isError ? 'error' : 'warning', isError ? error.message : warning!.message);
    }
  }

  getAllErrors() {
    return Object.keys(this.validationErrors) ? this.validationErrors : null;
  }

  private addRecord(key: string, constraint: string, type: 'error' | 'warning', message: string) {
    this.validationErrors[key] = {
      type,
      constraint,
      message: `${type === 'error' ? 'Constrângere nerespectată' : 'Atenționare'}: ${constraint}; ${message}`
    }
  }

}

export const parliamentStructure: FormStructure = {
  sections: [
    {
      title: 'Numărul total al alegătorilor',
      subtitle: 'Numărați toate persoanele de pe următoarele liste:',
      fields: [
        {
          id: 'a',
          type: 'computed',
          computeFn: (form) => {
            return form.get('a1').value + form.get('a2').value + form.get('a3').value;
          },
          title: 'Toate listele',
          hint: 'a. Numărul total al alegătorilor prevăzuți în listele electorale existente în secția de votare; a = a1 + a2 + a3',
          meaning: FieldMeaning.RegisteredVotersTotal,
        },
        {
          id: 'a1',
          type: 'input',
          title: 'a1. Lista permanentă',
          hint: 'a1. Numărul total al alegătorilor potrivit listei electorale permanente',
          meaning: FieldMeaning.RegisteredVoters,
        },
        {
          id: 'a2',
          type: 'input',
          title: 'a2. Lista suplimentară',
          hint: 'a2. Numărul total al alegătorilor potrivit listei electorale suplimentare',
          meaning: FieldMeaning.RegisteredVoters,
        },
        {
          id: 'a3',
          type: 'input',
          title: 'a3. Listă urnă specială',
          hint: 'a3. Numărul total al alegătorilor în cazul cărora s-a folosit urna specială',
          meaning: FieldMeaning.RegisteredVoters,
        },
      ]
    },
    {
      title: 'Numărul alegătorilor care au votat',
      subtitle: 'Numărați doar persoanele care și-au exercitat dreptul la vot de pe următoarele liste:',
      fields: [
        {
          id: 'b',
          type: 'computed',
          computeFn: (form) => {
            return form.get('b1').value + form.get('b2').value + form.get('b3').value;
          },
          title: 'b. Toate listele',
          hint: 'b. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în listele electorale existente în secția de votare; b = b1 + b2 + b3',
          meaning: FieldMeaning.ParticipatingVotersTotal,
        },
        {
          id: 'b1',
          type: 'input',
          title: 'b1. Lista permanentă',
          hint: 'b1. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală permanentă',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b2',
          type: 'input',
          title: 'b2. Lista suplimentară',
          hint: 'b2. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală suplimentară',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Listă urnă specială',
          hint: 'b3. Numărul total al alegătorilor care s-au prezentat la urne, în cazul cărora s-a folosit urna specială',
          meaning: FieldMeaning.ParticipatingVoters,
        },
      ]
    },
    {
      title: 'Buletine de vot',
      subtitle: 'Numărați buletinele de vot',
      fields: [
        {
          id: 'c',
          type: 'input',
          title: 'c. Buletine de vot primite',
          hint: 'c. Numărul buletinelor de vot primite',
          meaning: FieldMeaning.ReceivedBallots,
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Buletine de vot anulate',
          hint: 'd. Numărul buletinelor de vot întrebuințate și anulate',
          meaning: FieldMeaning.SpoiledBallots,
        }
      ],
    },
    {
      title: 'Voturi exprimate',
      subtitle: 'Numărați voturile exprimate',
      fields: [
        {
          id: 'e',
          type: 'computed',
          computeFn: (form) => {
            const value = form.value;
            const hKeys = Object.keys(value).filter(key => key.startsWith('h'));
            return hKeys.reduce((acc, key) => acc + value[key], 0);
          },
          title: 'e. Voturi valabil exprimate',
          hint: 'e. Numărul total al voturilor valabil exprimate',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Voturi nule',
          hint: 'f. Numărul voturilor nule',
          meaning: FieldMeaning.InvalidVotes,
        },
        {
          id: 'g',
          type: 'input',
          title: 'g. Voturi albe',
          hint: 'g. Numărul voturilor albe (buletine de vot pe care nu s-a aplicat ștampila "VOTAT")',
          meaning: FieldMeaning.InvalidVotes,
        },
      ],
    }
  ],
  candidateSectionKey: 'h',
  validator: (formGroup) => {
    const validator = new Validator(formGroup.value);
    validator.assertConstraint({
      key: 'a1_b1',
      constraint: 'a1 ≥ b1',
      error: {
        condition: (value) => value['a1'] < value['b1'],
        message: 'Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'a2_b2',
      constraint: 'a2 ≥ b2',
      error: {
        condition: (value) => value['a2'] < value['b2'],
        message: 'Numărul de votanți prezenți pe lista suplimentară nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'a3_b3',
      constraint: 'a3 ≥ b3',
      error: {
        condition: (value) => value['a3'] < value['b3'],
        message: 'Numărul de votanți prezenți pe lista pentru urnă specială nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'c_d_e_f_g',
      constraint: 'c ≥ d + e + f + g',
      error: {
        condition: (value) => value['c'] < value['d'] + value['e'] + value['f'] + value['g'],
        message: 'Numărul de buletine de vot primite nu poate fi mai mic decât cele anulate însumate cu cele intrate în urnă.'
      },
      warning: {
        condition: (value) => value['c'] > value['d'] + value['e'] + value['f'] + value['g'],
        message: 'Este de preferat ca numărul de buletine de vot primite să coincidă cu cele anulate însumate cu cele intrate în urnă.'
      }
    });
    validator.assertConstraint({
      key: 'e_b_f_g',
      constraint: 'e ≤ [b - (f + g)]',
      error: {
        condition: (value) => value['e'] > value['b'] - (value['f'] + value['g']),
        message: 'Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule/albe.'
      },
      warning: {
        condition: (value) => value['e'] < value['b'] - (value['f'] + value['g']),
        message: 'Este de preferat ca numărul de voturi valabil exprimate să fie egal cu diferența dintre numărul de votanți prezenți și voturile nule/albe.'
      }
    });
    return validator.getAllErrors();
  },
  simpvPullStrategy: (formGroup, simpvPrecinct) => {
    formGroup.get('a1')!.setValue(simpvPrecinct.initial_count_lp);
    formGroup.get('a2')!.setValue(simpvPrecinct.LS);
    formGroup.get('a3')!.setValue(simpvPrecinct.UM);
    formGroup.get('b1')!.setValue(simpvPrecinct.LP);
    formGroup.get('b2')!.setValue(simpvPrecinct.LS);
    formGroup.get('b3')!.setValue(simpvPrecinct.UM);
    return {
      county: simpvPrecinct['county']['code'],
      number: +simpvPrecinct['precinct']['nr'],
      uatName: simpvPrecinct['uat']['name'],
    };
  },
};

export const localsStructure: FormStructure = {
  sections: [
    {
      title: 'Numărul total al alegătorilor',
      subtitle: 'Numărați toate persoanele de pe următoarele liste:',
      fields: [
        {
          id: 'a',
          type: 'computed',
          computeFn: (form) => {
            return form.get('a1').value + form.get('a2').value + form.get('a3').value + form.get('a4').value;
          },
          title: 'Toate listele',
          hint: 'a. Numărul total al alegătorilor prevăzuți în listele electorale existente în secția de votare; a = a1 + a2 + a3 + a4',
          meaning: FieldMeaning.RegisteredVotersTotal,
        },
        {
          id: 'a1',
          type: 'input',
          title: 'a1. Lista permanentă',
          hint: 'a1. Numărul total al alegătorilor potrivit listei electorale permanente; a1 ≥ b1',
          meaning: FieldMeaning.RegisteredVoters,
        },
        {
          id: 'a2',
          type: 'input',
          title: 'a2. Lista complementară',
          hint: 'a2. Numărul total al alegătorilor potrivit copiei de pe lista electorală complementară; a2 ≥ b2',
          meaning: FieldMeaning.RegisteredVoters,
        },
        {
          id: 'a3',
          type: 'input',
          title: 'a3. Lista suplimentară',
          hint: 'a3. Numărul total al alegătorilor potrivit listei electorale suplimentare; a3 ≥ b3',
          meaning: FieldMeaning.RegisteredVoters,
        },
        {
          id: 'a4',
          type: 'input',
          title: 'a4. Listă urnă specială',
          hint: 'a4. Numărul total al alegătorilor în cazul cărora s-a folosit urna specială; a4 ≥ b4',
          meaning: FieldMeaning.RegisteredVoters,
        },
      ]
    },
    {
      title: 'Numărul alegătorilor care au votat',
      subtitle: 'Numărați doar persoanele care și-au exercitat dreptul la vot de pe următoarele liste:',
      fields: [
        {
          id: 'b',
          type: 'computed',
          computeFn: (form) => {
            return form.get('b1').value + form.get('b2').value + form.get('b3').value + form.get('b4').value;
          },
          title: 'b. Toate listele',
          hint: 'b. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în listele electorale existente în secția de votare; b = b1 + b2 + b3 + b4',
          meaning: FieldMeaning.ParticipatingVotersTotal,
        },
        {
          id: 'b1',
          type: 'input',
          title: 'b1. Lista permanentă',
          hint: 'b1. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală permanentă',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b2',
          type: 'input',
          title: 'b2. Lista complementară',
          hint: 'b2. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în copia de pe lista electorală complementară',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Lista suplimentară',
          hint: 'b3. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală suplimentară',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b4',
          type: 'input',
          title: 'b4. Listă urnă specială',
          hint: 'b4. Numărul total al alegătorilor care s-au prezentat la urne, în cazul cărora s-a folosit urna specială',
          meaning: FieldMeaning.ParticipatingVoters,
        },
      ]
    },
    {
      title: 'Buletine de vot și voturi exprimate',
      subtitle: 'Numărați buletinele de vot și voturile exprimate',
      fields: [
        {
          id: 'c',
          type: 'computed',
          computeFn: (form) => {
            const value = form.value;
            const hKeys = Object.keys(value).filter(key => key.startsWith('g'));
            return hKeys.reduce((acc, key) => acc + value[key], 0);
          },
          title: 'c. Voturi valabil exprimate',
          hint: 'c. Numărul total al voturilor valabil exprimate; c ≤ b - d',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Voturi nule',
          hint: 'd. Numărul voturilor nule',
          meaning: FieldMeaning.InvalidVotes,
        },
        {
          id: 'e',
          type: 'input',
          title: 'e. Buletine de vot primite',
          hint: 'e. Numărul buletinelor de vot primite; e ≥ c + d + f',
          meaning: FieldMeaning.ReceivedBallots,
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Buletine de vot anulate',
          hint: 'f. Numărul buletinelor de vot întrebuințate și anulate',
          meaning: FieldMeaning.SpoiledBallots,
        }
      ]
    }
  ],
  candidateSectionKey: 'g',
  validator: (formGroup) => {
    const validator = new Validator(formGroup.value);
    validator.assertConstraint({
      key: 'a1_b1',
      constraint: 'a1 ≥ b1',
      error: {
        condition: (value) => value['a1'] < value['b1'],
        message: 'Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'a2_b2',
      constraint: 'a2 ≥ b2',
      error: {
        condition: (value) => value['a2'] < value['b2'],
        message: 'Numărul de votanți prezenți pe lista complementară nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'a3_b3',
      constraint: 'a3 ≥ b3',
      error: {
        condition: (value) => value['a3'] < value['b3'],
        message: 'Numărul de votanți prezenți pe lista suplimentară nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'a4_b4',
      constraint: 'a4 ≥ b4',
      error: {
        condition: (value) => value['a4'] < value['b4'],
        message: 'Numărul de votanți prezenți pe lista pentru urnă specială nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'c_b_d',
      constraint: 'c ≤ b - d',
      error: {
        condition: (value) => value['c'] > value['b'] - value['d'],
        message: 'Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule.'
      },
      warning: {
        condition: (value) => value['c'] < value['b'] - value['d'],
        message: 'Este de preferat ca numărul de voturi valabil exprimate să fie egal cu diferența dintre numărul de votanți prezenți și voturile nule.'
      }
    });
    validator.assertConstraint({
      key: 'e_c_d_f',
      constraint: 'e ≥ c + d + f',
      error: {
        condition: (value) => value['e'] < value['c'] + value['d'] + value['f'],
        message: 'Numărul de buletine de vot primite nu poate fi mai mic decât cele intrate în urnă însumate cu cele anulate.'
      },
      warning: {
        condition: (value) => value['e'] > value['c'] + value['d'] + value['f'],
        message: 'Este de preferat ca numărul de buletine de vot primite să coincidă cu cele intrate în urnă însumate cu cele anulate.'
      }
    });
    return validator.getAllErrors();
  },
  simpvPullStrategy: (formGroup, simpvPrecinct) => {
    formGroup.get('a1')!.setValue(simpvPrecinct.initial_count_lp);
    formGroup.get('a2')!.setValue(simpvPrecinct.initial_count_lc);
    formGroup.get('a3')!.setValue(simpvPrecinct.LS);
    formGroup.get('a4')!.setValue(simpvPrecinct.UM);
    formGroup.get('b1')!.setValue(simpvPrecinct.LP);
    formGroup.get('b2')!.setValue(simpvPrecinct.LC);
    formGroup.get('b3')!.setValue(simpvPrecinct.LS);
    formGroup.get('b4')!.setValue(simpvPrecinct.UM);
    return {
      county: simpvPrecinct['county']['code'],
      number: +simpvPrecinct['precinct']['nr'],
      uatName: simpvPrecinct['uat']['name'],
    };
  }
};

export const europeansStructure: FormStructure = {
  sections: [
    {
      title: 'Numărul total al alegătorilor',
      subtitle: 'Numărați toate persoanele de pe următoarele liste:',
      fields: [
        {
          id: 'a',
          type: 'computed',
          computeFn: (form) => {
            return form.get('a1').value + form.get('a2').value;
          },
          title: 'Toate listele',
          hint: 'a. Numărul total al alegătorilor înscriși în lista electorală permanentă și în copia de pe lista electorală specială; a = a1 + a2',
          meaning: FieldMeaning.RegisteredVotersTotal,
        },
        {
          id: 'a1',
          type: 'input',
          title: 'a1. Lista permanentă',
          hint: 'a1. Numărul total al alegătorilor înscriși în lista electorală permanentă; a1 ≥ b1',
          meaning: FieldMeaning.RegisteredVoters,
        },
        {
          id: 'a2',
          type: 'input',
          title: 'a2. Lista specială',
          hint: 'a2. Numărul total al alegătorilor înscriși în copia de pe lista electorală specială; a2 ≥ b2',
          meaning: FieldMeaning.RegisteredVoters,
        },
      ]
    },
    {
      title: 'Numărul alegătorilor care au votat',
      subtitle: 'Numărați doar persoanele care și-au exercitat dreptul la vot de pe următoarele liste:',
      fields: [
        {
          id: 'b',
          type: 'computed',
          computeFn: (form) => {
            return form.get('b1').value + form.get('b2').value + form.get('b3').value;
          },
          title: 'b. Toate listele',
          hint: 'b. Numărul total al alegătorilor înscriși în listele electorale existente la secţia de votare, care s-au prezentat la urne; b = b1 + b2 + b3',
          meaning: FieldMeaning.ParticipatingVotersTotal,
        },
        {
          id: 'b1',
          type: 'input',
          title: 'b1. Lista permanentă',
          hint: 'b1. Numărul total al alegătorilor înscriși în lista electorală permanentă, care s-au prezentat la urne',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b2',
          type: 'input',
          title: 'b2. Lista specială',
          hint: 'b2. Numărul total al alegătorilor înscriși în copia de pe lista electorală specială, care s-au prezentat la urne',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Listă suplimetară',
          hint: 'b3. Numărul total al alegătorilor înscriși în lista electorală suplimentară, care s-au prezentat la urne',
          meaning: FieldMeaning.ParticipatingVoters,
        }
      ]
    },
    {
      title: 'Buletine de vot',
      subtitle: 'Numărați buletinele de vot',
      fields: [
        {
          id: 'c',
          type: 'input',
          title: 'c. Buletine de vot primite',
          hint: 'c. Numărul buletinelor de vot primite; c ≥ d + e + f',
          meaning: FieldMeaning.ReceivedBallots,
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Buletine de vot anulate',
          hint: 'd. Numărul buletinelor de vot întrebuințate și anulate',
          meaning: FieldMeaning.SpoiledBallots,
        }
      ],
    },
    {
      title: 'Voturi exprimate',
      subtitle: 'Numărați voturile exprimate',
      fields: [
        {
          id: 'e',
          type: 'computed',
          computeFn: (form) => {
            const value = form.value;
            const hKeys = Object.keys(value).filter(key => key.startsWith('g'));
            return hKeys.reduce((acc, key) => acc + value[key], 0);
          },
          title: 'e. Voturi valabil exprimate',
          hint: 'e. Numărul voturilor valabil exprimate; e ≤ b - f',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Voturi nule',
          hint: 'f. Numărul voturilor nule',
          meaning: FieldMeaning.InvalidVotes,
        },
      ],
    }
  ],
  candidateSectionKey: 'g',
  validator: (formGroup) => {
    const validator = new Validator(formGroup.value);
    validator.assertConstraint({
      key: 'a1_b1',
      constraint: 'a1 ≥ b1',
      error: {
        condition: (value) => value['a1'] < value['b1'],
        message: 'Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'a2_b2',
      constraint: 'a2 ≥ b2',
      error: {
        condition: (value) => value['a2'] < value['b2'],
        message: 'Numărul de votanți prezenți pe lista specială nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'c_d_e_f',
      constraint: 'c ≥ d + e + f',
      error: {
        condition: (value) => value['c'] < value['d'] + value['e'] + value['f'],
        message: 'Numărul de buletine de vot primite nu poate fi mai mic decât cele anulate însumate cu cele intrate în urnă.'
      },
      warning: {
        condition: (value) => value['c'] > value['d'] + value['e'] + value['f'],
        message: 'Este de preferat ca numărul de buletine de vot primite să coincidă cu cele anulate însumate cu cele intrate în urnă.'
      }
    });
    validator.assertConstraint({
      key: 'e_b_f',
      constraint: 'e ≤ b - f',
      error: {
        condition: (value) => value['e'] > value['b'] - value['f'],
        message: 'Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule.'
      },
      warning: {
        condition: (value) => value['e'] < value['b'] - value['f'],
        message: 'Este de preferat ca numărul de voturi valabil exprimate să fie egal cu diferența dintre numărul de votanți prezenți și voturile nule.'
      }
    });
    return validator.getAllErrors();
  },
  simpvPullStrategy: (formGroup, simpvPrecinct) => {
    formGroup.get('a1')!.setValue(simpvPrecinct.initial_count_lp);
    formGroup.get('a2')!.setValue(simpvPrecinct.UM);
    formGroup.get('b1')!.setValue(simpvPrecinct.LP);
    formGroup.get('b2')!.setValue(simpvPrecinct.UM);
    formGroup.get('b3')!.setValue(simpvPrecinct.LS);
    return {
      county: simpvPrecinct['county']['code'],
      number: +simpvPrecinct['precinct']['nr'],
      uatName: simpvPrecinct['uat']['name'],
    };
  },
};

export const presidentialsStructure: FormStructure = {
  sections: [
    {
      title: 'Numărul total al alegătorilor',
      subtitle: 'Numărați toate persoanele de pe lista electorală permanentă',
      fields: [
        {
          id: 'a',
          type: 'input',
          title: 'a. Lista permanentă',
          hint: 'a. Numărul total al alegătorilor prevăzut în lista electorală permanentă existentă în secția de votare; a ≥ b1',
          meaning: FieldMeaning.RegisteredVoters,
        },
      ]
    },
    {
      title: 'Numărul alegătorilor care au votat',
      subtitle: 'Numărați doar persoanele care și-au exercitat dreptul la vot de pe următoarele liste:',
      fields: [
        {
          id: 'b',
          type: 'computed',
          computeFn: (form) => {
            return form.get('b1').value + form.get('b2').value + form.get('b3').value;
          },
          title: 'b. Toate listele',
          hint: 'b. Numărul total al alegătorilor care s-au prezentat la urne; b = b1 + b2 + b3',
          meaning: FieldMeaning.ParticipatingVotersTotal,
        },
        {
          id: 'b1',
          type: 'input',
          title: 'b1. Lista permanentă',
          hint: 'b1. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală permanentă',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b2',
          type: 'input',
          title: 'b2. Lista suplimentară',
          hint: 'b2. Numărul total al alegătorilor care s-au prezentat la urne și nu sunt cuprinși în lista electorală permanentă, înscriși în lista electorală suplimentară',
          meaning: FieldMeaning.ParticipatingVoters,
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Listă urnă specială',
          hint: 'b3. Numărul total al alegătorilor care au votat utilizând urna specială, înscriși în extrasul din listele electorale',
          meaning: FieldMeaning.ParticipatingVoters,
        },
      ],
    },
    {
      title: 'Buletine de vot și voturi exprimate',
      subtitle: 'Numărați buletinele de vot și voturile exprimate',
      fields: [
        {
          id: 'c',
          type: 'computed',
          computeFn: (form) => {
            const value = form.value;
            const hKeys = Object.keys(value).filter(key => key.startsWith('g'));
            return hKeys.reduce((acc, key) => acc + value[key], 0);
          },
          title: 'c. Voturi valabil exprimate',
          hint: 'c. Numărul total al voturilor valabil exprimate; c ≤ b - d',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Voturi nule',
          hint: 'd. Numărul voturilor nule',
          meaning: FieldMeaning.InvalidVotes,
        },
        {
          id: 'e',
          type: 'input',
          title: 'e. Buletine de vot primite',
          hint: 'e. Numărul buletinelor de vot primite; e ≥ c + d + f',
          meaning: FieldMeaning.ReceivedBallots,
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Buletine de vot anulate',
          hint: 'f. Numărul buletinelor de vot întrebuințate și anulate',
          meaning: FieldMeaning.SpoiledBallots,
        }
      ]
    }
  ],
  candidateSectionKey: 'g',
  validator: (formGroup) => {
    const validator = new Validator(formGroup.value);
    validator.assertConstraint({
      key: 'a_b1',
      constraint: 'a ≥ b1',
      error: {
        condition: (value) => value['a'] < value['b1'],
        message: 'Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă.'
      }
    });
    validator.assertConstraint({
      key: 'c_b_d',
      constraint: 'c ≤ b - d',
      error: {
        condition: (value) => value['c'] > value['b'] - value['d'],
        message: 'Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule.'
      },
      warning: {
        condition: (value) => value['c'] < value['b'] - value['d'],
        message: 'Este de preferat ca numărul de voturi valabil exprimate să fie egal cu diferența dintre numărul de votanți prezenți și voturile nule.'
      }
    });
    validator.assertConstraint({
      key: 'e_c_d_f',
      constraint: 'e ≥ c + d + f',
      error: {
        condition: (value) => value['e'] < value['c'] + value['d'] + value['f'],
        message: 'Numărul de buletine de vot primite nu poate fi mai mic decât cele intrate în urnă însumate cu cele anulate.'
      },
      warning: {
        condition: (value) => value['e'] > value['c'] + value['d'] + value['f'],
        message: 'Este de preferat ca numărul de buletine de vot primite să coincidă cu cele intrate în urnă însumate cu cele anulate.'
      }
    });
    return validator.getAllErrors();
  },
  simpvPullStrategy: (formGroup, simpvPrecinct) => {
    formGroup.get('a')!.setValue(simpvPrecinct.initial_count_lp);
    formGroup.get('b1')!.setValue(simpvPrecinct.LP);
    formGroup.get('b2')!.setValue(simpvPrecinct.LS);
    formGroup.get('b3')!.setValue(simpvPrecinct.UM);
    return {
      county: simpvPrecinct['county']['code'],
      number: +simpvPrecinct['precinct']['nr'],
      uatName: simpvPrecinct['uat']['name'],
    };
  },
}

export const referendumStructure: FormStructure = {
  sections: [
    {
      title: 'Numărul total al alegătorilor',
      subtitle: 'Numărați toate persoanele înscrise în lista pentru referendum',
      fields: [
        {
          id: '1',
          type: 'input',
          title: '1. Lista pentru referendum',
          hint: '1. Numărul persoanelor înscrise în lista pentru referendum',
          meaning: FieldMeaning.RegisteredVoters,
        },
      ]
    },
    {
      title: 'Numărul participanților',
      subtitle: 'Numărați persoanele care și-au exercitat dreptul la vot',
      fields: [
        {
          id: '2',
          type: 'input',
          title: '2. Numărul participanților',
          hint: '2. Numărul participanților; 2 = 5 + 6 + 7',
          meaning: FieldMeaning.ParticipatingVoters,
        },
      ]
    },
    {
      title: 'Buletine de vot',
      subtitle: 'Numărați buletinele de vot',
      fields: [
        {
          id: '3',
          type: 'input',
          title: '3. Buletine de vot primite',
          hint: '3. Numărul buletinelor de vot primite pentru a fi întrebuinţate',
          meaning: FieldMeaning.ReceivedBallots,
        },
        {
          id: '4',
          type: 'input',
          title: '4. Buletine de vot anulate',
          hint: '4. Numărul de buletine de vot rămase neîntrebuinţate',
          meaning: FieldMeaning.SpoiledBallots,
        }
      ],
    },
    {
      title: 'Voturi exprimate',
      subtitle: 'Numărați voturile exprimate',
      fields: [
        {
          id: '5',
          type: 'input',
          title: '5. Voturi la răspunsul "DA"',
          hint: '5. Numărul voturilor valabil exprimate la răspunsul "DA"',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: '6',
          type: 'input',
          title: '6. Voturi la răspunsul "NU"',
          hint: '6. Numărul voturilor valabil exprimate la răspunsul "NU"',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: '7',
          type: 'input',
          title: '7. Voturi nule',
          hint: '7. Numărul voturilor nule',
          meaning: FieldMeaning.InvalidVotes,
        },
      ],
    }
  ],
  validator: (formGroup) => {
    const validator = new Validator(formGroup.value);
    validator.assertConstraint({
      key: '2_5_6_7',
      constraint: '2 = 5 + 6 + 7',
      error: {
        condition: (value) => (value['2'] || 0) !== value['5'] + value['6'] + value['7'],
        message: 'Numărul de participanți trebuie să fie egal cu numărul de voturi exprimate.'
      }
    });
    return validator.getAllErrors();
  },
  simpvPullStrategy: (formGroup, simpvPrecinct) => {
    formGroup.get('1')!.setValue(simpvPrecinct.initial_count_lp);
    formGroup.get('2')!.setValue(simpvPrecinct.LT);
    return {
      county: simpvPrecinct['county']['code'],
      number: +simpvPrecinct['precinct']['nr'],
      uatName: simpvPrecinct['uat']['name'],
    };
  },
}
