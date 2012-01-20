Teorija električnih kola
========================

Projekat je napravljen u edukacione svrhe. Live preview se može naći na http://proof.github.com/tek i može da kasni par verzija u odnosu na trenutan source.

Autori:
+ Nemanja Miljković (proof1337@gmail.com)
+ Marin Markić (mane90bg@gmail.com)


Dodavanje zadataka
==================

Zadatak treba biti u odgovarajućem fajlu u folderu(`zadaci`), i trebao bi se kategorisati. Primer je `kolokvijum.2011.js`, u kome se nalaze 2 zadatka sa kolokvijuma 2011. godine.
Slike zadataka se nalaze u folderu `zadaci/slike`a optimalan format 600x350 piksela. Guide će pretpostaviti, bar minimalno poznavanje JavaScript-a.

### Osnove

Zadatke treba wrappovati u jQuery document.ready callback:

    $(document).ready(function(){
        // ovde zadaci
    });

Ili (što je ekvivalentno):

    $(function(){
        // ovde zadaci
    });

Sledeće što je potrebno jeste konstruisati zadatak:

    var ustaljen_odziv = new Zadatak();

Atributi zadatka se mogu postavljati na 2 načina:

    var ustaljen_odziv = new Zadatak({
        ime: 'Ustaljen odziv',
        opis: 'Kolokvijum 2011. - prvi zadatak'
    });

    // ili
    var ustaljen_odziv = new Zadatak();
    ustaljen_odziv.set({
        ime: 'Ustaljen odziv',
        opis: 'Kolokvijum 2011. - prvi zadatak'
    });

Ovde će se koristiti prvi oblik.

Od atributa, Zadatak ima:
+ ime - Ime zadatka, mora biti unikatno
+ opis - Kratak opis zadatka
+ slika - Ime slike zadatka, koje se automatski traže u `zadaci/slike`
+ tekst - Tekst zadatka
+ parametri - Niz parametara
+ pobude - Niz pobuda
+ odzivi - Niz odziva
+ slug - Automatski generisano od imena, koristi se za url

### Parametri

Parametar predstavlja neku promenljivu koja se može naći u jednačinama odziva i pojavljuje se na strani kao textbox koji može da se edituje.

Od atributa, Parametar ima:
+ naziv - Naziv parametra. Moguće je koristiti latex.
+ jedinica - Jedinica koja se koristi za parametar
+ pvrednost - Početna vrednost
+ manjeOdNule - Boolean: ako je "true", dozvoljava se da parametar bude manji od nule
+ jednakoNuli - Boolean: ako je "true", dozvoljava se da parametar bude jednak nuli

Ne moraju se definisati svi atributi prilikom kreiranja Parametra, već se vrši provera naziva i u odnosu na neka pravila postavljaju se početne vrednosti:
+ naziv je R ili počinje sa R_ - u pitanju je otpornost
    jedinica - ohm
    manjeOdNule - false
    jednakoNuli - true
+ naziv je L ili počinje sa L_ - u pitanju je induktivnost
    jedinica - H
    manjeOdNule - false
    jednakoNuli - true
+ naziv je C ili počinje sa C_ - u pitanju je kapacitivnost
    jedinica - F
    manjeOdNule - false
    jednakoNuli - true
+ naziv je I ili počinje sa I_ - u pitanju je struja
    jedinica - A
    manjeOdNule - true
    jednakoNuli - true
+ naziv je (U ili E) ili počinje sa (U_ ili E_) - u pitanju je napon
    jedinica - V
    manjeOdNule - true
    jednakoNuli - true

Primer kreiranja parametara za 1. zadatak na kolokvijumu 2011.:
    
    parametri: [
        new Parametar({naziv: 'R', jednakoNuli: false, pvrednost: 3}),
        new Parametar({naziv: 'C', jednakoNuli: false, pvrednost: 1}),
        new Parametar({naziv: 'E', pvrednost: 5})
    ]


### Pobude

Pobuda sadrži samo `naziv` i `formula` od atributa.

    pobude: [
        new Pobuda({naziv: 'E', formula: 'const.'})
    ]

### Odzivi

Odzivi sadrže sledeće atribute:
+ naziv - Ime napona/struje čiji se odziv traži
+ formula - Formula odziva u latex-u
+ grafik - Funkcija koja prima određene argumente, i vraća vrednost odziva
+ t - Vreme do kog će se prvi put iscrtati grafik
+ cache - Funkcija u kojoj se mogu neke konstante izračunati

Za razliku od parametara i pobuda, oni imaju više atributa, pa ih je najbolje napraviti posebno, a onda dodati zadatku:

    var U_odziv = new Odziv({
        naziv: 'U',
        formula: '\\frac{IR}{2} + IR sin(\\frac{t}{\\sqrt{LC}}) + IR cos(\\frac{t}{2\\sqrt{LC}})',
        grafik: function(c, t) {
            return c.I + c.I * Math.sin(t / Math.sqrt(c.L * c.C)) + c.I * Math.cos(t / ( 2 * Math.sqrt(c.L * c.C)));
        },
        t: 50
    });

    ustaljen_odziv2.get('odzivi').push(U_odziv);

#### Cache

Primer:

    cache: function(c) {
        return {
            halfRC: 1/(2 * c.R * c.C),
            sqrt3: Math.sqrt(3)
        }
    }

Cache funkcija treba da vrati objekat sa preračunatim vrednostima. U primeru se računa 1/(2RC) i koren(3), da se ne bi računao za svaku tačku ponaosob. Ne mora da se koristi, ali se malo štedi na performansama.

#### Grafik

Primer:

    grafik: function(c, t, cc) {
        return c.E + Math.exp(-t * cc.halfRC) * (c.E * Math.cos(cc.sqrt3 * cc.halfRC * t) + c.E / cc.sqrt3 * Math.sin(cc.sqrt3 * cc.halfRC * t));
    }

Funkcija prima 3 argumenta: parametre, vreme i konstante koje su keširane.

Prvi argument predstavlja parametre kola. Kao što se vidi u primeru, parametar sa nazivom `E` se dohvata preko prvog argumenta (c.E).
Drugi argument predstavlja vreme.
Treći argument predstavlja šta god da je vraćeno iz funkcije `cache`, ukoliko ona postoji.

### Finishing touches

Kada se podesi zadatak, *OBAVEZNO* pozvati `zadatak.done()`:

    ustaljen_odziv2.done();

Nakon toga je potrebno zadatak dodati u niz zadataka nazvan `Zadaci`:

    Zadaci.push(potpuni_odziv);

And that's it!

Bugovi
======

Ukoliko pronađete neke greške/nedostatke, napravite issue ili pošaljite mail na proof1337@gmail.com.

Slanje zadataka
===============

Ukoliko želite da pošaljete zadatke koje ste napravili, možete to uraditi slanjem zadatka na proof1337@gmail.com ili forkovanjem ovog repo-a i slanjem pull request-a.
