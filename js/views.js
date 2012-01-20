$(function(){
    var _IzaberiZadatakView = Backbone.View.extend({
        el: $('div#content'),
        template: $('#izbor-zadataka-tpl').html(),

        view: {
            zadaci: window.Zadaci
        },

        render: function() {
            this.el.html(Mustache.render(this.template, this.view));
            return this;
        }
    });

    var _ZadatakView = Backbone.View.extend({
        el: $('div#content'),
        template: $('#zadatak-tpl').html(),
        parametri_template: $('#parametri-tpl').html(),
        zadatak: undefined,
        graphs: [],

        events: {
            'keydown #parametri input[type="text"]': 'updateParameters',
            'click #parametri a#edit-values': 'updateParameters',
            'click #parametri a#reset-values': 'defaultParameters'
        },

        postaviZadatak: function(zadatak) {
            this.zadatak = zadatak;
            this.graphs = [];

            for (var i in zadatak.get('odzivi')) {
                var view = new _GraphView();
                view.zadatak = zadatak;
                view.odziv = zadatak.get('odzivi')[i];
                this.graphs.push(view);
            }
        },

        render: function() {
            this.el.html(Mustache.render(this.template, this.zadatak.toJSON()));
            this.renderGraphs();
            this.zadatak.unbind('error');
            this.zadatak.setErrorCallback(this.zadatakError);
            return this;
        },

        renderGraphs: function() {
            var els = this.el.find('#odzivi li');
            var els_array = [];

            els.each(function(){
                els_array.push($(this));
            });

            for (var i in this.graphs) {
                this.graphs[i].el = els_array[i];
                this.graphs[i].render();
            }
        },

        updateParameters: function(event) {
            if (event.type != 'click' && event.keyCode != 13)
                return;
            
            event.preventDefault();
            var that = this;
            $('#parametri input[type="text"]').each(function(){
                $(this).removeClass('error');

                var element = $(this);
                var param_name = element.attr('name');
                var param_value = parseFloat(element.attr('value'));
                that.zadatak.setParameter(param_name, param_value);
            });

            that.zadatak.save();
            this.renderGraphs();
        },

        defaultParameters: function(event) {
            event.preventDefault();
            this.zadatak.reset();
            var that = this;
            $('#parametri input[type="text"]').each(function(){
                $(this).removeClass('error');
                for (var i in that.zadatak.get('parametri')) {
                    if (that.zadatak.get('parametri')[i].get('naziv') != $(this).attr('name'))
                        continue;

                    $(this).val(that.zadatak.get('parametri')[i].get('vrednost'));
                    break;
                }
            });
        },

        zadatakError: function(model, error) {
            if (model instanceof Parametar) {
                $('#parametri input[type="text"]').each(function(){
                    if ($(this).attr('name') != model.get('naziv'))
                        return true;
                    
                    $(this).addClass('error');
                    $(this).focus();
                    return false;
                });
            }
        }
    });

    var _GraphView = Backbone.View.extend({
        odziv: undefined,
        zadatak: undefined,
        slider_value: undefined,

        render: function() {
            if (this.odziv == undefined) {
                console.log('Greska! Odziv nije definisan.');
                return;
            }
            
            if (this.zadatak == undefined) {
                console.log('Greska! Zadatak nije definisan.');
                return;
            }

            var slider_el = this.el.find('div.slider');
            if (!slider_el.hasClass('ui-slider')) {
                slider_el.slider({
                    range: 'min',
                    //range: true,
                    min: 0, max: 100,
                    //values: [this.odziv.get('t0'), this.odziv.get('t')],
                    value: this.odziv.get('t'),
                    slide: this.sliderHandle
                });
                this.slider_value = this.el.find('div.slider-value').html(this.odziv.get('t0') + 's - ' + this.odziv.get('t') + 's');
                slider_el.data('view', this);

                var modeDiv = this.el.find('div.mode');
                modeDiv.buttonset();
                modeDiv.find('input[type="radio"]').click(this.handleModeChange);
                modeDiv.find('input[data-mode="' + this.odziv.get('mode') + '"]').click();
            }

            var canvas = this.el.find('canvas');
            var ctx = canvas[0].getContext('2d');
            
            var cwidth = canvas.attr('width'), cheight = canvas.attr('height');
            var pointsCnt = cwidth;
            var points = this.odziv.getPoints(this.zadatak.get('paramsConfig'), this.odziv.get('t0'), this.odziv.get('t'), pointsCnt);

            var dx = (cwidth) / pointsCnt;
            var dy = cheight / 2 / Math.max(Math.abs(points.max), Math.abs(points.min)) * 0.90;
            ctx.clearRect(0, 0, cwidth, cheight);

            this.renderAxes(ctx, this.odziv.get('t0'), cwidth, cheight);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0499da';
            ctx.translate(0, cheight / 2);
            ctx.beginPath();
            while (points.points.length) {
                var p = points.points.shift();
                ctx.lineTo((pointsCnt - points.points.length - 1) * dx, p * dy);
            }
            ctx.stroke();
            ctx.closePath();
            ctx.translate(0, -cheight / 2);
        },

        renderAxes: function(ctx, t0, cwidth, cheight) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#666'; // evil
            ctx.beginPath();
            ctx.moveTo(0, cheight / 2);
            ctx.lineTo(cwidth, cheight / 2);
            ctx.stroke();
            ctx.closePath();

            if (t0 == 0) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#666'; // evil
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, cheight);
                ctx.stroke();
                ctx.closePath();
            }
        },

        sliderHandle: function(event, slider) {
            $(this).parents('li').find('div.slider-value').html(/*slider.values[0] + "s - " + slider.values[1]*/ slider.value + 's');
            var view = $(this).data('view');
            //view.odziv.set({t0: slider.values[0]});
            view.odziv.set({t: slider.value/*values[1]*/});
            view.zadatak.save();
            view.render();
        },

        handleModeChange: function() {
            var mode = parseInt($(this).attr('data-mode'));
            var max, step;

            switch (mode) {
                case 1:
                    max = 1;
                    step = 0.001;
                    break;
                case 2:
                    max = 10;
                    step = 0.1;
                    break;
                case 3:
                    max = 100;
                    step = 1;
                    break;
                case 4:
                    max = 1000;
                    step = 10;
                    break;
            }

            var slider_el = $(this).parents('li').find('div.slider');
            slider_el.slider('option', {max: max, step: step});
            
            var odziv = slider_el.data('view').odziv;
            odziv.set({t: (odziv.get('t') > max) ? max : odziv.get('t')});
            //odziv.set({t0: (odziv.get('t0') > max) ? max : odziv.get('t0')});

            //slider_el.slider('option', 'values', [odziv.get('t0'), odziv.get('t')]);
            slider_el.slider('option', 'value', odziv.get('t'));
            slider_el.slider('option', 'slide')
                .call(slider_el, null, { handle: $('.ui-slider-handle', slider_el), value: odziv.get('t') });
        }
    });

    window.IzaberiZadatakView = new _IzaberiZadatakView();
    window.ZadatakView = new _ZadatakView();
});
