$(document).ready(function(){

	$('#logout-button').on('click', function(e){
		e.preventDefault();

		$.ajax({
			method: 'DELETE',
			url: '/api/logout-user'
		}).then(function(res){
			window.location.href = "/"
		});
	});

	$(".create-bio").on('click', function(){
		$('#bio-modal').modal('toggle')
	})

	$("#bio-form").on('submit', function(e){
		e.preventDefault();

		const inputs = {
			shortBio: $("#bio-input").val(),
			pictureLink: $("#picture-input").val(),
			movie: $("#movie-input").val(),
			song: $("#song-input").val(),
			pizza: $("#pizza-input").val()
		}

		$.ajax({
			method: 'POST',
			url: '/api/user-bio',
			dataType: 'json',
			data: JSON.stringify(inputs),
			contentType: 'application/json'
		}).then(function(res){
			window.location.href = "/profile/" + res.id;
		}).catch(function(err){
			alert(err);
		})
	})

});
