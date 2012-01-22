$(function(){
    var ustaljen_odziv = new Zadatak({
        ime: 'Устаљен одзив',
        opis: 'Колоквијум 2011. - први задатак',
        slika: 'kol2011.1.png',
        tekst: 'Прекидач је затворен и одзив је устаљен. У тренутку <em>t<sub>0</sub></em> прекидач се отвара. Одредити тренутну вредност напона кондензатора, за <em>t > t<sub>0</sub></em>, ако је L = CR<sup>2</sup>.',
        parametri: [
                new Parametar({naziv: 'R', jednakoNuli: false, pvrednost: 3}),
                new Parametar({naziv: 'C', jednakoNuli: false, pvrednost: 1}),
                new Parametar({naziv: 'E', pvrednost: 5})
            ],
        pobude: [
                new Pobuda({naziv: 'E', formula: 'const.'})
            ]
    });

    var Uc_odziv = new Odziv({
        naziv: 'u_c',
        formula: 'E + e^{-\\frac{t - t_0}{2 R C}} [E cos(\\frac{\\sqrt{3}}{2 R C} (t - t_0)) + \\frac{E}{\\sqrt{3}} sin(\\frac{\\sqrt{3}}{2 R C} (t - t_0))]',
        grafik: function(c, t, cc) {
            return c.E + Math.exp(-t * cc.halfRC) * (c.E * Math.cos(cc.sqrt3 * cc.halfRC * t) + c.E / cc.sqrt3 * Math.sin(cc.sqrt3 * cc.halfRC * t));
        },
        cache: function(c) {
            return {
                halfRC: 1/(2 * c.R * c.C),
                sqrt3: Math.sqrt(3)
            }
        },
        t: 50
    });

    ustaljen_odziv.get('odzivi').push(Uc_odziv);
    ustaljen_odziv.done();

    Zadaci.push(ustaljen_odziv);

    var potpuni_odziv = new Zadatak({
        ime: 'Потпуни одзив',
        opis: 'Колоквијум 2011 - други задатак',
        slika: 'kol2011.2.png',
        tekst: 'Вредности елемената електричног кола су познате. R<sub>1</sub> = R<sub>2</sub> = 2R и <em>t<sub>0</sub></em> = 0. Одредити струју калема за <em>t > t<sub>0</sub></em>.',
        parametri: [
                new Parametar({naziv: 'R', jednakoNuli: false, pvrednost: 30}),
                new Parametar({naziv: 'L', jednakoNuli: false, pvrednost: 20}),
                new Parametar({naziv: 'I_0', pvrednost: -10}),
                new Parametar({naziv: 'I_m', pvrednost: 5}),
                new Parametar({naziv: 'U_m', pvrednost: 220})
            ],
        pobude: [
                new Pobuda({naziv: 'u_g', formula: 'U_m h(t)'}),
                new Pobuda({naziv: 'i_g', formula: 'I_m e^{-t\\frac{R}{L}} h(t)'})
            ]
    });
    
    var Il_odziv = new Odziv({
        naziv: 'i_L',
        formula: 'I_0 e^{- \\frac{R}{L} t} + \\frac{R}{L} I_m t e^{- \\frac{R}{L} t} h(t) + \\frac{1}{2 R} U_m (-e^{-\\frac{R}{L} t} + 1) h(t)',
        grafik: function(c, t) {
            return c.I_0 * Math.exp(-t * c.R/c.L) + c.R/c.L * c.I_m * t * Math.exp(-t * c.R/c.L)  + 1 / ( 2 * c.R) * c.U_m * (-Math.exp(-t * c.R/c.L) + 1);
        },
        t: 9
    });
    
    potpuni_odziv.get('odzivi').push(Il_odziv);
    potpuni_odziv.done();

    Zadaci.push(potpuni_odziv);
});
