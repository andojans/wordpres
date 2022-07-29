/* global jQuery */
jQuery( function ( $ ) {
	'use strict';

	function rateyoReivew() {
		if ( ! $( ".penci_rateyo_reivew" ).length ) {
			return false;
		}


		$( ".penci_rateyo_reivew" ).each( function( ){

		var $this = $( this ),
			rate = parseFloat( $this.data( 'rate' ) ),
			allow = $this.data( 'allow' ),
			total = $this.data( 'total' ),
			people_numb = parseInt( $this.data( 'people' ) );

			if( rate ){
				$this.rateYo( {
					rating: rate,
					fullStar: false,
					starWidth: "14px",
					spacing: "3px",
					readOnly: true,
					normalFill: PENCI.normalFill,
					ratedFill: PENCI.ratedFill,
				} );
			}else{
				$this.rateYo( {
					rating: rate,
					fullStar: true,
					starWidth: "14px",
					spacing: "3px",
					normalFill: PENCI.normalFill,
					ratedFill: PENCI.ratedFill,
					onSet: function ( rating, rateYoInstance ) {
						jQuery( this ).rateYo( "option", "readOnly", true );
						var postid = jQuery( this ).data( 'postid' );

						jQuery.ajax( {
							type: "POST",
							url: PENCI.ajaxUrl,
							dataType: 'html',
							data: {action: 'penci_pennews_rateyo_reivew', nonce: PENCI.nonce, postid: postid, rating: rating},
							success: function ( response ) {
								var parent = jQuery( this ).closest( '.penci-review-text' ),
									new_rate = (
										           total + rating
									           ) / (
										           people_numb + 1
									           ),
									thisParent = $this.closest( '.penci-review-text' );

								jQuery( '.penci-rate-number', parent ).html( new_rate );

								$this.rateYo( "rating", new_rate );
								thisParent.find( '.penci-rate-number' ).html( new_rate.toPrecision( 2 ) );
								thisParent.find( '.penci-number-people' ).html( people_numb + 1 );
								thisParent.find( '.penci-text-votes' ).removeClass( 'penci-hide-text-votes' );
							}
						} );
					}
				} );
			}


			if ( allow == '0' ) {
				$this.rateYo( "option", "readOnly", true );
			}
		} );
	}


	function userrateyoReivew() {
		if ( ! $( ".penci-reivew-star-rateYo" ).length ) {
			return false;
		}

		$( ".penci-reivew-star-rateYo" ).each( function( ){

			var $rateYo = $( this ),
				rating = $rateYo.attr( 'data-rating' );

			if( rating ){
				$rateYo.rateYo( {
					rating: rating,
					fullStar: true,
					starWidth: "18px",
					spacing: "3px",
					readOnly: true,
					normalFill: PENCI.normalFill,
					ratedFill: PENCI.ratedFill,
				} );
			}else{
				var	$input = $rateYo.next( '.penci-reivew-star-value' ),
					value = $input.val();

				$rateYo.rateYo( {
					rating: value,
					fullStar: true,
					starWidth: "18px",
					spacing: "3px",
					normalFill: PENCI.normalFill,
					ratedFill: PENCI.ratedFill,
				} ).on( "rateyo.change", function ( e, data ) {
					var rating = data.rating;
					$( this ).next().val( rating );
				} );
			}
		} );

	}

	function saveUserReview(){
		var $reviewFrom = $( '#penci-review-form' );

		if( ! $reviewFrom.length ){
			return false;
		}

		$reviewFrom.submit( function( e ){
			e.preventDefault();

			var $this =  $( this ),
				$spinner = $this.find( '.penci-review-spinner' ),
				$mess = $this.next( '.penci-review-mess' );

			$spinner.addClass( 'active' );
			$mess.html('').hide();

			$.ajax( {
				type: "POST",
				url: PENCI.ajaxUrl,
				data: {
					action: 'penci_review_user_rating',
					nonce: PENCI.nonce,
					data: $this.serialize()
				},
				success: function ( response ) {

					$spinner.removeClass( 'active' );

					if( response.data.mess ){
						$mess.html( response.data.mess ).slideDown( );
					}

					if( response.success ){
						setTimeout(function() {
							var linkReload = window.location.href;
							if ( 'undefined' != typeof(response.data.link_reload) && response.data.link_reload ) {
								linkReload = response.data.link_reload;
							}
							window.location.assign(linkReload);
						}, 3000 );
					}else{
						$mess.addClass( 'error' );
					}
				}
			} );
		} );
	}

	function GetURLParameter( sParam ){
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	}

	function scrollToReview(){
		var viewru = GetURLParameter( 'user_review_id' ),
			$viewruID = $('.penci-ur-'+ viewru ),
		    $tabNav = $( '.penci-tab-nav' ),
			idTabReview = '#review-' + PENCI.postID + '-comment';

		if( $tabNav.length && (  $viewruID.length || idTabReview === window.location.hash )  ){
			$tabNav.find( 'li' ).removeClass( 'active' );
			$tabNav.find( '.review-comment' ).addClass( 'active' );
			$( '.penci-tab-content .penci-tab-pane' ).removeClass( 'active' );
			$( '.penci-tab-content .multi-review-comment' ).addClass( 'active' );
		}

		if( $viewruID.length ){
			var $offset =  $viewruID.offset().top;

			$('html, body').animate({
				scrollTop: $offset - 100
			}, 'slow');
		}
	}

	function userReviewLike(){
		var $urLike = $( '.penci-ur-like' );

		if( ! $urLike.length ){
			return false;
		}

		$urLike.each( function( e ){
			var $this = $( this );

			$this.on( 'click', function(){
				event.preventDefault();
				var $this = $( this ),
					likeCount = $this.attr( 'data-count' ),
					$commentID = $this.attr( 'data-comment_id' ),
					$parent = $this.parent(),
					$spinner = $parent.find( '.penci-review-spinner' ),
					$mess = $parent.find( '.penci-review-judge-mess' );

				$mess.html('').hide();
				$spinner.addClass( 'active' );

				$.ajax( {
					type: "POST",
					url: PENCI.ajaxUrl,
					data: {
						action: 'penci_review_user_like',
						nonce: PENCI.nonce,
						commentID: $commentID,
						likeCount: likeCount
					},
					success: function ( response ) {

						$spinner.removeClass( 'active' );

						if( response.success && typeof response.data.likeCount !== 'undefined' ){
							$this.find( '.penci-share-number' ).html( response.data.likeCount );
							$this.attr( 'data-count', response.data.likeCount );
						}

						if( response.data.mess ){
							$mess.html( response.data.mess ).slideDown();
						}
					}
				} );

			} );
		} );
	}

	function userReviewDisLike(){
		var $urLike = $( '.penci-ur-dislike' );

		if( ! $urLike.length ){
			return false;
		}

		$urLike.each( function( e ){
			var $this = $( this );

			$this.on( 'click', function(){
				event.preventDefault();
				var $this = $( this ),
					likeCount = $this.attr( 'data-count' ),
					$commentID = $this.attr( 'data-comment_id' ),
					$parent = $this.parent(),
					$spinner = $parent.find( '.penci-review-spinner' ),
					$mess = $parent.find( '.penci-review-judge-mess' );

				$mess.html('').hide();
				$spinner.addClass( 'active' );

				$.ajax( {
					type: "POST",
					url: PENCI.ajaxUrl,
					data: {
						action: 'penci_review_user_dislike',
						nonce: PENCI.nonce,
						commentID: $commentID,
						likeCount: likeCount
					},
					success: function ( response ) {

						$spinner.removeClass( 'active' );

						if( response.success && typeof response.data.likeCount !== 'undefined' ){
							$this.find( '.penci-share-number' ).html( response.data.likeCount );
							$this.attr( 'data-count', response.data.likeCount );
						}

						if( response.data.mess ){
							$mess.html( response.data.mess ).slideDown();
						}
					}
				} );

			} );
		} );
	}


	$( document ).ready( function () {
		rateyoReivew();
		userrateyoReivew();
		saveUserReview();
		scrollToReview();
		userReviewLike();
		userReviewDisLike();
	} );
} );
