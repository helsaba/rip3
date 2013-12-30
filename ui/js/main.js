$(document).ready(function() {
	setupExamples();
	setupRipper();
	pageChanged();
});

$(window).bind('popstate', function(e) {
	pageChanged();
	e.stopPropagation();
});

function pageChanged() {
	$('a:focus').blur(); // Blur focused link
	var keys = getQueryHashKeys();
	if      ('stats'   in keys) { showPage('page-stats'); }
	else if ('site'    in keys) { showPage('page-about-site'); }
	else if ('terms'   in keys) { showPage('page-about-terms'); }
	else if ('removal' in keys) { showPage('page-about-removal'); }
	else if ('code'    in keys) { showPage('page-about-code'); }
	else if ('albums'  in keys) {
		showPage('albums');
		// TODO Load albums
	}
	else if ('album' in keys) {
		showPage('album');
		// TODO Load album at keys.album
	}
	else if (window.location.hash.indexOf('.') >= 0) {
		/* TODO */
		// Page to rip
		showPage('page-rip');
		startRip(window.location.hash.substring(1));
	}
	else {
		showPage('page-rip');
		$('#text-rip-album').val('');
		$('#button-rip-album, #text-rip-album').removeAttr('disabled');
		$('#status-rip-album').html('');
	}
}

function getSpinner() {
	return $('<img/>')
		.attr('src', 'ui/images/spinner.gif')
		.css({
			'width'  : '30px',
			'height' : '30px',
			'margin-left'  : '5px',
			'margin-right' : '5px',
		});
}

function startRip(baseurl) {
	var url = decodeURIComponent(baseurl);
	if (url.indexOf('http') != 0) {
		url = 'http://' + url;
	}
	$('#text-rip-album')
		.val(url);
	$('#text-rip-album,#button-rip-album')
		.attr('disabled', 'disabled');
	$('#status-rip-album')
		.html(' getting album info...')
		.prepend( getSpinner() )
		.hide()
		.fadeIn(500);
	var request = 'api.cgi?method=rip_album&url=' + encodeURIComponent(url)
	var ajax = $.getJSON(request)
		.fail(function() { /* TODO */ })
		.done(function(json) {
			$('#button-rip-album').removeData('ajax');
			if ('error' in json) {
				// TODO handle error
				$('#status-rip-album')
					.addClass('text-danger')
					.html(json.error);
				if ('trace' in json) {
					$('<div class="text-left" style="line-height: 1.0em"/>')
						.append( $('<small/>').html(json.trace) )
						.appendTo( $('#status-rip-album') );
				}
			}
			else {
				if ('warning' in json) {
					$('#status-rip-album').empty();
					$('<div class="text-warning"/>')
						.html(json.warning)
						.prepend( getSpinner() )
						.prependTo( $('#status-rip-album') );
				}
				else {
					$('#status-rip-album')
						.html('images retrieved, ripping will start momentarily')
						.prepend( getSpinner() );
				}
				// Redirect to album
				setTimeout(function() {
					window.location.hash = 'album=' + json.path;
				}, 1500);
			}
			$('#text-rip-album,#button-rip-album').removeAttr('disabled');
		});
	$('#button-rip-album').data('ajax', ajax);
}

function abortRip() {
	var ajax = $('#button-rip-album').data('ajax');
	if (ajax !== undefined) {
		ajax.abort();
	}
	$('#text-rip-album').val('');
	$('#button-rip-album, #text-rip-album').removeAttr('disabled');
	$('#status-rip-album').html('');
}

/** Hide current page, show page with 'id' */
function showPage(id) {
	// Hide current page(s)
	$('body [id^="page-"]:visible')
		.stop()
		.fadeOut(200);
	// Deselect nav-bar
	$('a[id^="nav-"]').parent().removeClass('active');
	// Hide drop-down navbar (xs view)
	if ( $('.navbar-collapse').hasClass('in') ) {
		$('.navbar-toggle').click();
	}
	// Scroll up
	$('html,body').stop().animate({ 'scrollTop': 0 }, 500);
	// Show the page
	$('#' + id)
		.stop()
		.hide()
		.fadeIn(500);
}

/* Convert keys in hash to JS object */
function getQueryHashKeys() {
	var a = window.location.hash.substring(1).split('&');
	if (a == "") return {};
	var b = {};
	for (var i = 0; i < a.length; ++i) {
		var p=a[i].split('=');
		if (p.length != 2) {
			b[p[0]] = '';
			continue;
		}
		b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	}
	return b;
}

/** Format numbers > 999 to contain commas in thousands-places */
function addCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Sets example URLs for all supported sites. */
function setupExamples() {
	var ALBUM_EXAMPLES = {
		'imgur'       : 'http://imgur.com/a/DU74E', //'http://imgur.com/a/RdXNa',
		'tumblr'      : 'http://owlberta.tumblr.com/tagged/me',
		'twitter'     : 'https://twitter.com/MrNMissesSmith',
		'deviantart'  : 'http://geekysica.deviantart.com/gallery/40343783',
		'flickr'      : 'https://secure.flickr.com/photos/peopleofplatt/sets/72157624572361792/with/6166517381/',
		'photobucket' : 'http://s1216.beta.photobucket.com/user/Liebe_Dich/profile/',
		'instagram'   : 'http://instagram.com/joselyncano#',
		'imagefap'    : 'http://www.imagefap.com/pictures/2885204/Kentucky-Craigslist',
		'imagearn'    : 'http://imagearn.com/gallery.php?id=1616', // 'http://imagearn.com/gallery.php?id=82587',
		'imagebam'    : 'http://www.imagebam.com/gallery/3b73c0f6ba797e77a33b46779fbfe678/',
		'xhamster'    : 'http://xhamster.com/photos/gallery/1479233/sarah_from_glasgow.html',
		'getgonewild' : 'http://getgonewild.com/profile/EW2d',
		'anonib'      : 'http://www.anonib.com/azn/res/74347.html',
		'4chan'       : 'http://boards.4chan.org/s/res/14020907',
		'motherless'  : 'http://motherless.com/GC1FEFF5',
		'minus'       : 'http://nappingdoneright.minus.com/mu6fuBNNdfPG0',
		'gifyo'       : 'http://gifyo.com/robynsteen/', // http://gifyo.com/LinzieNeon/',
		'cghub'       : 'http://katiedesousa.cghub.com/images/',
		'chansluts'   : 'http://www.chansluts.com/camwhores/girls/res/3405.php',
		'teenplanet'  : 'http://photos.teenplanet.org/atomicfrog/Latino_M4N/Ass_Beyond_Belief',
		'butttoucher' : 'http://butttoucher.com/users/Shelbolovesnate',
		'imgbox'      : 'http://imgbox.com/g/UyaOUEBXzO',
		'reddit'      : 'http://reddit.com/user/thatnakedgirl',
		'fuskator'    : 'http://fuskator.com/full/l4IoKiE51-K/1012_chicas123_exotic_landysh_met-art_old+chicks.html#',
		'redditsluts' : 'http://redditsluts.soup.io/tag/Miss_Ginger_Biscuit',
		'kodiefiles'  : 'http://www.kodiefiles.nl/2010/10/ff-eerder-gezien.html',
		'gallerydump' : 'http://www.gallery-dump.com/index.php?gid=553056',
		'fapdu'       : 'http://fapdu.com/cuties-4.view/',
		'seenive'     : 'http://seenive.com/u/911429150038953984',
		'nfsfw'       : 'http://nfsfw.com/gallery/v/Emily%20Ratajkowski',
	};

	for (var key in ALBUM_EXAMPLES) {
		$('#supported-album a:contains("' + key + '")')
			.html(key)
			.attr('href', '#' + ALBUM_EXAMPLES[key].replace(/https?:\/\/(www\.)?/, ''));
	}

	var VIDEO_EXAMPLES = { /* TODO */ };
	// TODO VIDEO_EXAMPLES
}

function setupRipper() {
	$('#button-rip-album')
		.click(function() {
			var url = $('#text-rip-album').val();
			url = url.replace(/https?:\/\/(www\.)/, '');
			window.location.hash = url;
		});
	$('#text-rip-album')
		.keydown(function(e) {
			if (e.keyCode === 13) {
				$('#button-rip-album').click();
			}
		});
}
