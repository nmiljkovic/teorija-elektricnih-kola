$(function(){
    var ustaljen_odziv2 = new Zadatak({
        ime: 'Суперпозиција устаљеног одзива',
        opis: 'Септембар 2009. - први задатак',
        slika: 'sept2009.1.png',
        tekst: 'Електрично коло са слике има познате вредности елемената:  L1 = L ,  L2 = 2L , C1 = C , C2 = 2C ,  R1 = R2 = R. Одзив је устаљен.  Одредити напон струјног изворa.',
        parametri: [
                new Parametar({naziv: 'R', jednakoNuli: false, pvrednost: 20}),
                new Parametar({naziv: 'C', jednakoNuli: false, pvrednost: 0.5}),
                new Parametar({naziv: 'L', jednakoNuli: false, pvrednost: 10}),
                new Parametar({naziv: 'I', pvrednost: 1})
            ],
        pobude: [
                new Pobuda({naziv: 'I_g', formula: 'I + I sin(\\frac{t}{\\sqrt{LC}}) + \\\\ I cos(\\frac{t}{2\\sqrt{LC}})'})
            ]
    });

    var U_odziv = new Odziv({
        naziv: 'U',
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
