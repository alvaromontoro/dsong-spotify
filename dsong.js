var model = sp.require('sp://import/scripts/api/models');

exports.init = init;

var loadedPosts = 0;
var activePost = null;
var firstLoad = true;

function init() {
	getRecentPosts(true);
}

function getRecentPosts() {
	$.ajax({
		url: "http://www.dsong.es/api/dsong/dsong_getposts/?n=20&offset=" + loadedPosts + "&donotcachepage=918a02d02c3ce8d2833a2f93dec8fcf1",
		dataType: "jsonp",
		success: function(data) {
			// TODO: Comprobar que funcione cuando no hay más artículos que mostrar
			loadedPosts += 20;
			$.each(data['posts'], function(index, value) {
				//if (data.posts[index].spotify != '') {
					var date = new Date(data.posts[index].timestamp * 1000);
					//var image = getImage(data.posts[index].spotify);
					//var imageHTML = '<img src="' + image + '" height="50px" />';
					$('#sidebar').append("<div class=\"post lastpost\" data-postid=\"" + data.posts[index].id + "\">" + data.posts[index].title /*+ date.toUTCString()*/ + "</div>");
				//}
			});

			if (firstLoad) {
				firstLoad = false;
				loadRecommendation($('.post:first'), false);
			}
		}
	});
}

function loadRecommendation(post, play) {
	$('#content #post').animate({ scrollTop: 0 }, 'slow');
	if (activePost != null)
		activePost.removeClass('active');
	activePost = post;
	activePost.addClass('active');
	$.ajax({
		url: "http://www.dsong.es/api/dsong/dsong_getpost/?id=" + post.data('postid') + "&donotcachepage=918a02d02c3ce8d2833a2f93dec8fcf1",
		dataType: "jsonp",
		success: function(data) {
			var html = '';
			html += '<h1>' + data.title + '</h1>';
			html += '<img src="' + data.thumbnail[0] + '" alt="" style="width:' + data.thumbnail[1] + 'px;height:' + data.thumbnail[2] + 'px;" />';
			html += data.content;
			$('#content #post').html(html);
			if (play && data.spotify != '')
				model.player.play(data.spotify);
			//setBGFromLastFM(getArtistNameFromURI(data.spotify));
			setBG(data.thumbnail[0]);
		}
	});
}

function setBGFromLastFM(artist) {

	$.ajax({
		url: 'http://ws.audioscrobbler.com/2.0/?format=json&method=artist.getinfo&artist=' + artist + '&api_key=d04e08f21ec6dc87080f3b106fffe621',
		dataType: 'jsonp',
		success: function(data) {
			var image = data.artist.image[data.artist.image.length-1]['#text'];
			
			$('#background').fadeTo('slow', 0.3, function() {
				$(this).css('background-image', 'url(' + image + ')');
			}).fadeTo('slow', 1);
		}
	});

}

function setBG(imageURL) {
	$('<img/>').attr('src', imageURL).load(function() {
		$('#background').fadeTo('slow', 0.3, function() {
			$(this).css('background-image', 'url(' + imageURL + ')');
		}).fadeTo('slow', 1);
	})
}

function getArtistNameFromURI(uri) {

	var artistName;
	switch (model.Link.getType(uri)) {
		case model.Link.TYPE.TRACK:
			artistName = model.Track.fromURI(uri).artists[0].name;
			break;
	}
	return artistName;

}

function getImage(uri) {

	var image;
	switch (model.Link.getType(uri)) {
		case model.Link.TYPE.TRACK:
			image = model.Track.fromURI(uri).image;
			break;
		case model.Link.TYPE.ALBUM:
			image = model.Album.fromURI(uri).cover;
			break;
		case model.Link.TYPE.PLAYLIST:
			image = model.Playlist.fromURI(uri).image;
			break;
	}
	return image;

}

$('.post').live('click', function() {
	loadRecommendation($(this), true);
});

$('#sidebar').scroll(function() {
	// TODO: Añadir indicador de cargando
	// TODO: Empezar a cargar un poco antes de llegar al final
	if ($("#sidebar")[0].scrollHeight == $('#sidebar').scrollTop()+$('#sidebar').height()) {
		getRecentPosts(false);
	}
});

// TODO: Combinar los dos siguientes callbacks
$(window).ready(function() {
	$('#sidebar').height($('html').height()-$('#header').height()-50);
	$('#content').height($('html').height()-$('#header').height());
	$('#content #post').height($('html').height()-$('#header').height()-150);
	//$('#content').width($('html').width()-$('#sidebar').width());
});

$(window).resize(function() {
	$('#sidebar').height($('html').height()-$('#header').height()-50);
	$('#content').height($('html').height()-$('#header').height());
	$('#content #post').height($('html').height()-$('#header').height()-150);
	//$('#content').width($('html').width()-$('#sidebar').width());
});

/////////////////////////////////////////////
// TEST /////////////////////////////////////
/////////////////////////////////////////////

// TODO: No funciona pero sería lo ideal para cuando llegue al final del scroll
/*$('.lastpost').appear(function() {
	console.log("hola!");
});*/

/*model.player.observe(model.EVENT.CHANGE, function(event) {
	console.log(model.player.track.artists[0].image);
	$('#content').css('background-image', 'url(' + model.player.track.artists[0].image + ')');
});*/
