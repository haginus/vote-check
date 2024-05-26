import { FormStructure } from "./types";

export const withWhiteVotesStructure: FormStructure = {
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
        },
        {
          id: 'a1',
          type: 'input',
          title: 'a1. Lista permanentă',
          hint: 'a1. Numărul total al alegătorilor potrivit listei electorale permanente',
        },
        {
          id: 'a2',
          type: 'input',
          title: 'a2. Lista suplimentară',
          hint: 'a2. Numărul total al alegătorilor potrivit listei electorale suplimentare',
        },
        {
          id: 'a3',
          type: 'input',
          title: 'a3. Listă urnă specială',
          hint: 'a3. Numărul total al alegătorilor în cazul cărora s-a folosit urna specială',
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
        },
        {
          id: 'b1',
          type: 'input',
          title: 'b1. Lista permanentă',
          hint: 'b1. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală permanentă',
        },
        {
          id: 'b2',
          type: 'input',
          title: 'b2. Lista suplimentară',
          hint: 'b2. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală suplimentară',
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Listă urnă specială',
          hint: 'b3. Numărul total al alegătorilor care s-au prezentat la urne, în cazul cărora s-a folosit urna specială',
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
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Buletine de vot anulate',
          hint: 'd. Numărul buletinelor de vot întrebuințate și anulate',
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
          hint: 'e. Numărul total al voturilor valabil exprimate'
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Voturi nule',
          hint: 'f. Numărul voturilor nule'
        },
        {
          id: 'g',
          type: 'input',
          title: 'g. Voturi albe',
          hint: 'g. Numărul voturilor albe (buletine de vot pe care nu s-a aplicat ștampila "VOTAT")'
        },
      ],
    }
  ],
  candidateSectionKey: 'h',
  validator: (formGroup) => {
    let errors: Record<string, string> = {};
    const value = formGroup.value;
    if(value.a1 < value.b1) {
      errors['a1_b1'] = 'Constrângere nerespectată: a1 ≥ b1 (Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.a2 < value.b2) {
      errors['a2_b2'] = 'Constrângere nerespectată: a2 ≥ b2 (Numărul de votanți prezenți pe lista suplimentară nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.a3 < value.b3) {
      errors['a3_b3'] = 'Constrângere nerespectată: a3 ≥ b3 (Numărul de votanți prezenți pe lista pentru urnă specială nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.c < value.d + value.e + value.f + value.g) {
      errors['c_d_e_f_g'] = 'Constrângere nerespectată: c ≥ d + e + f + g (Numărul de buletine de vot primite nu poate fi mai mic decât cele anulate însumate cu cele intrate în urne)';
    }
    if(value.e > value.b - (value.f + value.g)) {
      errors['e_b_f_g'] = 'Constrângere nerespectată: e ≤ [b - (f + g)] (Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule/albe)';
    }
    return Object.keys(errors).length > 0 ? errors : null;
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
