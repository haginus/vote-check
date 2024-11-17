import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bigNumber',
  standalone: true,
})
export class BigNumberPipe implements PipeTransform {

  transform(value: number): string {
    const ONE_THOUSAND = 1000;
    const ONE_MILLION = ONE_THOUSAND * ONE_THOUSAND;
    if(value > ONE_MILLION) {
      return (value / ONE_MILLION).toFixed(2) + 'M';
    }
    if(value > ONE_THOUSAND) {
      return (value / ONE_THOUSAND).toFixed(2) + 'K';
    }
    return value.toString();
  }

}
