var Zadatak = Backbone.Model.extend({
    defaults: {
        ime: '',
        opis: '',
        slika: '',
        tekst: '',
        parametri: undefined,
        pobude: undefined,
        odzivi: undefined,
        slug: ''
    },
    initialize: function() {
        var attr = this.attributes;

        if (attr.pobude == undefined) attr.pobude = [];
        if (attr.odzivi == undefined) attr.odzivi = [];
        if (attr.parametri == undefined) attr.parametri = [];
    },
    refresh: function() {
        var attr = this.attributes;

        for (var i in attr.parametri) {
            var done = false;

            for (var j in attr.paramsConfig) {
                if (attr.parametri[i].get('naziv') != j)
                    continue;

                done = true;
                attr.parametri[i].set({vrednost: attr.paramsConfig[j]});
                break;
            }

            if (!done) {
                this.save();
                return;
            }
        }

        for (var i in attr.odzivi) {
            var done = false;

            for (var j in attr.graphConfig) {
                if (attr.odzivi[i].get('naziv') != j)
                    continue;
                
                done = true;
                attr.odzivi[i].set({t: attr.graphConfig[j].t, t0: attr.graphConfig[j].t0})
            }

            if (!done) {
                this.save();
                return;
            }
        }
    },
    setParameter: function(name, value) {
        for (var i in this.get('parametri')) {
            if (this.get('parametri')[i].get('naziv') != name)
                continue;

            this.get('parametri')[i].set({vrednost: value});
            break;
        }
    },
    setErrorCallback: function(fn) {
        this.unbind('error');
        this.bind('error', fn);
        for (var i in this.get('parametri')) {
            this.get('parametri')[i].unbind('error');
            this.get('parametri')[i].bind('error', fn);
        }
    },
    done: function() {
        var attr = this.attributes;

        attr.ime_lat = toLatin(attr.ime);
        attr.slug = attr.ime_lat.replace(/\s+/g, '-').toLowerCase();

        if (localStorage != undefined && localStorage.getItem(attr.slug + '-params'))
            attr.paramsConfig = JSON.parse(localStorage.getItem(attr.slug + '-params'));
        else
            this.save();

        if (localStorage != undefined && localStorage.getItem(attr.slug + '-graph'))
            attr.graphConfig = JSON.parse(localStorage.getItem(attr.slug + '-graph'));
        else
            this.save();

        this.refresh();
    },
    save: function() {
        if (!localStorage)
            return;

        var attr = this.attributes;
        attr.paramsConfig = { };
        attr.graphConfig = { };

        for (var i in attr.parametri)
            attr.paramsConfig[attr.parametri[i].get('naziv')] = attr.parametri[i].get('vrednost');

        for (var i in attr.odzivi) {
            attr.graphConfig[attr.odzivi[i].get('naziv')] = {};
            attr.graphConfig[attr.odzivi[i].get('naziv')].t0 = attr.odzivi[i].get('t0');
            attr.graphConfig[attr.odzivi[i].get('naziv')].t = attr.odzivi[i].get('t');
            //attr.graphConfig[attr.odzivi[i].get('naziv')].mode = attr.odzivi[i].get('mode');
        }

        localStorage.setItem(attr.slug + '-params', JSON.stringify(attr.paramsConfig));
        localStorage.setItem(attr.slug + '-graph', JSON.stringify(attr.graphConfig));
    },
    reset: function() {
        for (var i in this.attributes.parametri)
            this.attributes.parametri[i].reset();

        this.save();
    }
});

var Parametar = Backbone.Model.extend({
    defaults: {
        naziv: '',
        jedinica: '',
        tip: undefined,
        pvrednost: 5,   // <- pocetna vrednost
        vrednost: 5,
        manjeOdNule: undefined,
        jednakoNuli: undefined
    },
    validate: function(attribs) {
        if (attribs.vrednost == 0 && !this.get('jednakoNuli'))
            return "Vrednost ne sme biti jednaka nuli!";
        
        if (attribs.vrednost < 0 && !this.get('manjeOdNule'))
            return "Vrednost mora biti veca ili jednaka nuli!";
    },
    reset: function() {
        this.set({vrednost: this.get('pvrednost')});
    },
    initialize: function() {
        var naziv = this.get('naziv');
        var tip = undefined, jedinica = this.get('jedinica');
        var jednakoNuli = this.get('jednakoNuli'), manjeOdNule = this.get('jednakoNuli');

        this.set({vrednost: this.get('pvrednost')});

        if (naziv.match(/^L($|_)/)) {
            jedinica = 'H';
            tip = 'induktivnost';
            jednakoNuli = (jednakoNuli == undefined) ? true : jednakoNuli;
            manjeOdNule = (manjeOdNule == undefined) ? false : manjeOdNule;
        }
        
        if (naziv.match(/^C($|_)/)) {
            jedinica = 'F';
            tip = 'kapacitivnost';
            jednakoNuli = (jednakoNuli == undefined) ? true : jednakoNuli;
            manjeOdNule = (manjeOdNule == undefined) ? false : manjeOdNule;
        }

        if (naziv.match(/^R($|_)/)) {
            jedinica = '&#8486;';
            tip = 'otpornost';
            jednakoNuli = (jednakoNuli == undefined) ? true : jednakoNuli;
            manjeOdNule = (manjeOdNule == undefined) ? false : manjeOdNule;
        }

        if (naziv.match(/^(U|E)($|_)/i)) {
            jedinica = 'V';
            tip = 'napon';
            jednakoNuli = (jednakoNuli == undefined) ? true : jednakoNuli;
            manjeOdNule = (manjeOdNule == undefined) ? true : manjeOdNule;
        }

        if (naziv.match(/^I($|_)/i)) {
            jedinica = 'A';
            tip = 'struja';
            jednakoNuli = (jednakoNuli == undefined) ? true : jednakoNuli;
            manjeOdNule = (manjeOdNule == undefined) ? true : manjeOdNule;
        }

        this.set({tip: tip, jedinica: jedinica, manjeOdNule: manjeOdNule, jednakoNuli: jednakoNuli});
    }
});

var Pobuda = Backbone.Model.extend({
    defaults: {
        naziv: '',
        formula: ''
    }
});

var Odziv = Backbone.Model.extend({
    defaults: {
        naziv: '',
        formula: '',
        grafik: undefined,
        cache: undefined,
        cached: undefined,
        t0: 0,
        t: 10,
        mode: undefined,
        fn: {hevisajd: function(t) { },
             dirak: function(t) { }}
    },
    initialize: function() {
        this.bind('change:t', function() {
            if (this.get('t') <= 1000) this.attributes.mode = 4;
            if (this.get('t') <= 100) this.attributes.mode = 3;
            if (this.get('t') <= 10) this.attributes.mode = 2;
            if (this.get('t') <= 1) this.attributes.mode = 1;
        });
        this.trigger('change:t');
    },
    getPoints: function(constants, t0, t1, count, maxtime) {
        if (this.get('grafik') == undefined) {
            console.log('Grafik nije dat za pobudu ' + this.get('naziv'));
            return;
        }

        if (t0 == t1) return {points: [], max: 0, min: 0};

        var points = {
            points: undefined,
            max: -10000000,
            min: 10000000
        };
        var diff = (t1 - t0) / count;
        var limit = t1 + diff, p;
        var t;

        if (this.get('cache') != undefined)
            this.set({cached: this.get('cache')(constants)});
        else
            this.set({cached: {}});

        points.points = [];

        if (t0 != 0) {
            for (t = 0; t < t0; t+= diff) {
                p = -this.get('grafik')(constants, t, this.get('cached'));
                if (points.max < p) points.max = p;
                if (points.min > p) points.min = p;
            }
        }
        
        for (t = t0; t < limit; t += diff)
        {
            p = -this.get('grafik')(constants, t, this.get('cached'));
            points.points.push(p);
            if (points.max < p) points.max = p;
            if (points.min > p) points.min = p;
        }

        if (maxtime != undefined) {
            for (; t < maxtime; t += diff) {
                p = -this.get('grafik')(constants, t, this.get('cached'));
                if (points.max < p) points.max = p;
                if (points.min > p) points.min = p;
            }
        }

        return points;
    }
});

function ZadaciFindBySlug(slug) {
    for (var i in Zadaci)
        if (Zadaci[i].get('slug') == slug) return Zadaci[i];

    return undefined;
}
