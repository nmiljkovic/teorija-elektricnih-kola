$(function(){
    var ustaljen_odziv2 = new Zadatak({
        ime: 'Суперпозиција устаљеног одзива',
        opis: 'Септембар 2009. - први задатак',
        slika: 'sept2009.1.png',
        tekst: 'Електрично коло са слике има познате вредности елемената:  <em>L<sub>1</sub></em> = <em>L</em>, <em>L<sub>2</sub></em> = <em>2L</em>, <em>C<sub>1</sub></em> = <em>C</em>, <em>C<sub>2</sub></em> = <em>2C</em>, <em>R<sub>1</sub></em> = <em>R<sub>2</sub></em> = <em>R</em>. Одзив је устаљен.  Одредити напон струјног изворa.',
        parametri: [
                new Parametar({naziv: 'R', jednakoNuli: false, pvrednost: 20}),
                new Parametar({naziv: 'C', jednakoNuli: false, pvrednost: 0.5}),
                new Parametar({naziv: 'L', jednakoNuli: false, pvrednost: 10}),
                new Parametar({naziv: 'I', pvrednost: 1})
            ],
        pobude: [
                new Pobuda({naziv: 'i_g', formula: 'I + I sin(\\frac{t}{\\sqrt{LC}}) + \\\\ I cos(\\frac{t}{2\\sqrt{LC}})'})
            ]
    });

    var U_odziv = new Odziv({
        naziv: 'u',
        formula: '\\frac{IR}{2} + IR sin(\\frac{t}{\\sqrt{LC}}) + IR cos(\\frac{t}{2\\sqrt{LC}})',
        grafik: function(c, t) {
            return c.I + c.I * Math.sin(t / Math.sqrt(c.L * c.C)) + c.I * Math.cos(t / ( 2 * Math.sqrt(c.L * c.C)));
        },
        t: 50
    });

    ustaljen_odziv2.get('odzivi').push(U_odziv);
    ustaljen_odziv2.done();

    Zadaci.push(ustaljen_odziv2);
});
