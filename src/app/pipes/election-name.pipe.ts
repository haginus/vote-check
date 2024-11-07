import { Pipe, PipeTransform } from '@angular/core';
import { Election } from '../../elections/types';

@Pipe({
  name: 'electionName',
  standalone: true,
})
export class ElectionNamePipe implements PipeTransform {

  transform(election: Election): string {
    return election.name || `${election.type.name} ${election.date.getFullYear()}`;
  }

}
