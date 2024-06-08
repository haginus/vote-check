import { FormStructure } from "./types";

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
        },
        {
          id: 'a1',
          type: 'input',
          title: 'a1. Lista permanentă',
          hint: 'a1. Numărul total al alegătorilor potrivit listei electorale permanente; a1 ≥ b1',
        },
        {
          id: 'a2',
          type: 'input',
          title: 'a2. Lista complementară',
          hint: 'a2. Numărul total al alegătorilor potrivit copiei de pe lista electorală complementară; a2 ≥ b2',
        },
        {
          id: 'a3',
          type: 'input',
          title: 'a3. Lista suplimentară',
          hint: 'a3. Numărul total al alegătorilor potrivit listei electorale suplimentare; a3 ≥ b3',
        },
        {
          id: 'a4',
          type: 'input',
          title: 'a4. Listă urnă specială',
          hint: 'a4. Numărul total al alegătorilor în cazul cărora s-a folosit urna specială; a4 ≥ b4',
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
          title: 'b2. Lista complementară',
          hint: 'b2. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în copia de pe lista electorală complementară',
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Lista suplimentară',
          hint: 'b3. Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală suplimentară',
        },
        {
          id: 'b4',
          type: 'input',
          title: 'b4. Listă urnă specială',
          hint: 'b4. Numărul total al alegătorilor care s-au prezentat la urne, în cazul cărora s-a folosit urna specială',
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
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Voturi nule',
          hint: 'd. Numărul voturilor nule',
        },
        {
          id: 'e',
          type: 'input',
          title: 'e. Buletine de vot primite',
          hint: 'e. Numărul buletinelor de vot primite; e ≥ c + d + f',
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Buletine de vot anulate',
          hint: 'f. Numărul buletinelor de vot întrebuințate și anulate',
        }
      ]
    }
  ],
  candidateSectionKey: 'g',
  validator: (formGroup) => {
    let errors: Record<string, string> = {};
    const value = formGroup.value;
    if(value.a1 < value.b1) {
      errors['a1_b1'] = 'Constrângere nerespectată: a1 ≥ b1 (Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.a2 < value.b2) {
      errors['a2_b2'] = 'Constrângere nerespectată: a2 ≥ b2 (Numărul de votanți prezenți pe lista complementară nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.a3 < value.b3) {
      errors['a3_b3'] = 'Constrângere nerespectată: a3 ≥ b3 (Numărul de votanți prezenți pe lista suplimentară nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.a4 < value.b4) {
      errors['a4_b4'] = 'Constrângere nerespectată: a4 ≥ b4 (Numărul de votanți prezenți pe lista pentru urnă specială nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.c > value.b - value.d) {
      errors['c_b_d'] = 'Constrângere nerespectată: c ≤ b - d (Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule)';
    }
    if(value.e < value.c + value.d + value.f) {
      errors['e_c_d_f'] = 'Constrângere nerespectată: e ≥ c + d + f (Numărul de buletine de vot primite nu poate fi mai mic decât cele intrate în urnă însumate cu cele anulate)';
    }
    return Object.keys(errors).length > 0 ? errors : null;
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
        },
        {
          id: 'a1',
          type: 'input',
          title: 'a1. Lista permanentă',
          hint: 'a1. Numărul total al alegătorilor înscriși în lista electorală permanentă; a1 ≥ b1',
        },
        {
          id: 'a2',
          type: 'input',
          title: 'a2. Lista specială',
          hint: 'a2. Numărul total al alegătorilor înscriși în copia de pe lista electorală specială; a2 ≥ b2',
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
        },
        {
          id: 'b1',
          type: 'input',
          title: 'b1. Lista permanentă',
          hint: 'b1. Numărul total al alegătorilor înscriși în lista electorală permanentă, care s-au prezentat la urne',
        },
        {
          id: 'b2',
          type: 'input',
          title: 'b2. Lista specială',
          hint: 'b2. Numărul total al alegătorilor înscriși în copia de pe lista electorală specială, care s-au prezentat la urne',
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Listă suplimetară',
          hint: 'b3. Numărul total al alegătorilor înscriși în lista electorală suplimentară, care s-au prezentat la urne',
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
            const hKeys = Object.keys(value).filter(key => key.startsWith('g'));
            return hKeys.reduce((acc, key) => acc + value[key], 0);
          },
          title: 'e. Voturi valabil exprimate',
          hint: 'e. Numărul voturilor valabil exprimate; e ≤ b - f',
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Voturi nule',
          hint: 'f. Numărul voturilor nule'
        },
      ],
    }
  ],
  candidateSectionKey: 'g',
  validator: (formGroup) => {
    let errors: Record<string, string> = {};
    const value = formGroup.value;
    if(value.a1 < value.b1) {
      errors['a1_b1'] = 'Constrângere nerespectată: a1 ≥ b1 (Numărul de votanți prezenți pe lista permanentă nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.a2 < value.b2) {
      errors['a2_b2'] = 'Constrângere nerespectată: a2 ≥ b2 (Numărul de votanți prezenți pe lista specială nu poate fi mai mare decât cei înscriși pe această listă)';
    }
    if(value.c < value.d + value.e + value.f) {
      errors['c_d_e_f'] = 'Constrângere nerespectată: c ≥ d + e + f (Numărul de buletine de vot primite nu poate fi mai mic decât cele anulate însumate cu cele intrate în urnă)';
    }
    if(value.e > value.b - value.f) {
      errors['e_b_f'] = 'Constrângere nerespectată: e ≤ b - f (Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule)';
    }
    return Object.keys(errors).length > 0 ? errors : null;
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
          hint: 'b2. Numărul total al alegătorilor care s-au prezentat la urne și nu sunt cuprinși în lista electorală permanentă, înscriși în lista electorală suplimentară',
        },
        {
          id: 'b3',
          type: 'input',
          title: 'b3. Listă urnă specială',
          hint: 'b3. Numărul total al alegătorilor care au votat utilizând urna specială, înscriși în extrasul din listele electorale',
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
        },
        {
          id: 'd',
          type: 'input',
          title: 'd. Voturi nule',
          hint: 'd. Numărul voturilor nule',
        },
        {
          id: 'e',
          type: 'input',
          title: 'e. Buletine de vot primite',
          hint: 'e. Numărul buletinelor de vot primite; e ≥ c + d + f',
        },
        {
          id: 'f',
          type: 'input',
          title: 'f. Buletine de vot anulate',
          hint: 'f. Numărul buletinelor de vot întrebuințate și anulate',
        }
      ]
    }
  ],
  candidateSectionKey: 'g',
  validator: (formGroup) => {
    let errors: Record<string, string> = {};
    const value = formGroup.value;
    if(value.a < value.b1) {
      errors['a_b1'] = 'Constrângere nerespectată: a ≥ b1 (Numărul de votanți prezenți pe lista permanentă nu poate fi mai mic decât cei înscriși pe această listă)';
    }
    if(value.c > value.b - value.d) {
      errors['c_b_d'] = 'Constrângere nerespectată: c ≤ b - d (Numărul de voturi valabil exprimate nu poate fi mai mare decât diferența dintre numărul de votanți prezenți și voturile nule)';
    }
    if(value.e < value.c + value.d + value.f) {
      errors['e_c_d_f'] = 'Constrângere nerespectată: e ≥ c + d + f (Numărul de buletine de vot primite nu poate fi mai mic decât cele intrate în urnă însumate cu cele anulate)';
    }
    return Object.keys(errors).length > 0 ? errors : null;
  },
  // TODO: simpvPullStrategy
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
        },
        {
          id: '4',
          type: 'input',
          title: '4. Buletine de vot anulate',
          hint: '4. Numărul de buletine de vot rămase neîntrebuinţate',
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
        },
        {
          id: '6',
          type: 'input',
          title: '6. Voturi la răspunsul "NU"',
          hint: '6. Numărul voturilor valabil exprimate la răspunsul "NU"',
        },
        {
          id: '7',
          type: 'input',
          title: '7. Voturi nule',
          hint: '7. Numărul voturilor nule',
        },
      ],
    }
  ],
  validator: (formGroup) => {
    let errors: Record<string, string> = {};
    const value = formGroup.value;
    Object.keys(value).forEach(key => {
      value[key] = +value[key];
    });
    if(value['2'] != value['5'] + value['6'] + value['7']) {
      errors['2_5_6_7'] = 'Constrângere nerespectată: 2 = 5 + 6 + 7 (Numărul de participanți trebuie să fie egal cu numărul de voturi exprimate)';
    }
    return Object.keys(errors).length > 0 ? errors : null;
  },
  // TODO: simpvPullStrategy
}
