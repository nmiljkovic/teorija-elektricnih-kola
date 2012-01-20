$(function(){
    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            'izbor-zadataka': 'izborZadataka',
            'zadatak/:slug': 'zadatak'
        },
        izborZadataka: function() {
            IzaberiZadatakView.render();
        },
        zadatak: function(slug) {
            ZadatakView.postaviZadatak(ZadaciFindBySlug(slug));
            ZadatakView.render();
            if (MathJax != undefined)
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    });

    var Router = new ApplicationRouter();

    Backbone.history.start();
    if (document.location.hash == '' || document.location.hash == '#')
        Router.navigate('izbor-zadataka', true);
    else
        Router.navigate(document.location.hash, true);

    window.Router = Router;
});

function toLatin(str) {
    var replacements = {
        a: /а/gi,
        b: /б/gi,
        c: [/ц/gi, /ћ/gi, /ч/gi],
        d: /д/gi,
        e: /е/gi,
        f: /ф/gi,
        g: /г/gi,
        h: /х/gi,
        i: /и/gi,
        j: /ј/gi,
        k: /к/gi,
        l: /л/gi,
        m: /м/gi,
        n: /н/gi,
        nj: /њ/gi,
        o: /о/gi,
        p: /п/gi,
        r: /р/gi,
        s: /с/gi,
        t: /т/gi,
        u: /у/gi,
        v: /в/gi,
        dj: /ђ/gi,
        z: [/з/gi, /ж/],
        lj: /љ/gi,
        dz: /џ/gi

    };
    var newstr = str;
    for (var i in replacements) {
        var repl = replacements[i];
        if (repl instanceof Array)
            for (var j in repl)
                newstr = newstr.replace(repl[j], i);
        else
            newstr = newstr.replace(repl, i);
    }

    return newstr;
}
