var $          = require('jquery-browserify'),
    accounting = require('accounting'),
    Player     = require('./player');

require('es5-shim');
require('./effects');

$(function() {
	"use strict";

	var player = new Player();

	window.player = player;

	$('#content').ajaxSuccess(function() {
		$.ajax({
			global: false,
			url: '/',
			success: function(data) {
				$('#content').children('.finance, .stats').remove();
				$('#content', data).children('.finance, .stats').addClass('visible').appendTo('#content');
			}
		});
	});

	// sync time with server
	setInterval(function() {
		//$.ajax({ url: '/tick', data: { scale: scale, now: now }, global: false }); //, success: console.log.bind(console) });
	}, 5000);

	// adjust time scaling
	$('#tscale').live('change', function() {
		var pad, $this = $(this);
		player.scale = $this.val();
		pad = new Array(4 - (''+player.scale).length).join('&nbsp;');
		$this.parent().children('.display.flow').html(pad + player.scale + '<sup>3</sup>x');
	});

	// game tick
	setInterval(function() {
		player.tick();
		$('#clock .clock').html(new Date(player.now).toUTCString().replace(/^[A-Za-z]+, |[A-Z]+$/g, ''));
		$('.finance').html(accounting.formatMoney(player.balance));
	}, 1000 / 27);

	// login
	$('.login form').live('submit', function(event) {
		event.preventDefault();

		var $this = $(this),
		    $els  = $this.find('input');

		$els.prop('readonly', true);

		$.post('/login', $this.serialize(), function(data) {
			var content = $('#content', data).html();

			$('#content').children('div').bloom({ opacity: 0 }, function() {
				$(this).parent().html(content).children('div').bloom({ opacity: 1 }, true);
			});
		}).error(function() {
			$els.prop('readonly', false);
		});
	});

	// map
	$('#map button').live('click', function() {
		var $this = $(this),
		    region = $(this).data('region');

		player.systems.add({ region: region });

		$this.text($this.text().replace(/\s+\(\d+\)\s*$/, '') + ' (' + player.systems[region].length + ')');

		$('.stats .systems').text(player.systems.count);
		$('.stats .mips').text(player.mips);
	});

	$(window).on('load', function() {
		setTimeout($.fn.bloom.bind($('#content > div'), { opacity: 1 }, true, function() {
			if (!location.hash.length || !$('.login form'))
				return;

			$('.login form input').val(location.hash.substr(1));
			$('.login form').submit();
		}), 1000);
	});
});
