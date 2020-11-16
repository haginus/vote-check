import { Pipe, PipeTransform } from '@angular/core';

const prepositions = ['A', 'Din', 'Și', 'Cu', 'De', 'La', 'Fără', 'Despre', 'În', 'Între', 'Pe', 'Până', 'Prin']

@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {

  transform(value: string): string {
    return value.toLowerCase().replace(/(?:^|[\s-/])\(*[\wăîșşțţâ]/g, function (match) {
      return match.toUpperCase();
    })
    .replace(/[\wăîșțâĂÎȘŞȚŢÂ]*/g, function(match) {
      return prepositions.includes(match) ? match.toLowerCase() : match;
    })
  }

}
