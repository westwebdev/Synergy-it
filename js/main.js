$(function() {
	$('.main_slider').slick({
		infinite: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: true,
		arrows: true
	});

	$('.sale_hit_slider').slick({
		infinite: true,
		slidesToShow: 4,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		// centerMode: true,
		variableWidth: true,
		responsive: [
		{
			breakpoint: 1420,
			settings: {
				centerMode: true,
				centerPadding: '40px',
			}
		}]
	});

	$('.brand_slider').slick({
		centerMode: true,
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		dots: false,
		variableWidth: true,
		arrows: true
	});


	/*item slider*/
	$('.slider-for').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		infinite: true,
		arrows: false,
		fade: true,
		asNavFor: '.slider-nav'
	});
	$('.slider-nav').slick({
		slidesToShow: 4,
		infinite: true,
		slidesToScroll: 1,
		asNavFor: '.slider-for',
		dots: false,
		arrows: true,	
		// centerMode: true,
		focusOnSelect: true

	});


	$('.top_menu').on('click', function() {
		$(this).next('.second_menu').slideToggle();
	});

	$('.header_menu_button').on('click', function() {
		$('.header_menu_list').slideToggle();
	});

	$('.aside_button').on('click', function() {
		$('.aside_block').slideToggle();
	});

	$(window).on('load resize', function() {
		var windowWidth = $(window).innerWidth();
		if(windowWidth < 991)
		{
			$('.header_menu_list').removeAttr('style');
		}
		if(windowWidth < 865)
		{
			$('.aside_container').removeAttr('style');
		}
	});

	$(window).on('load resize', function() {
		var headerHeight = $('header').outerHeight();
		var footerHeight = $('footer').outerHeight(true);
		var contentHeight = $('.main_container').outerHeight();
		var asideHeight = $('.aside_container').outerHeight();


		if(contentHeight < (asideHeight))
		{
			$('.main_container').outerHeight(asideHeight - 100);
		}
		if($('.aside_container').length == 0)
		{
			$('.main_container').outerHeight($(window).outerHeight() - headerHeight - $('.header_menu').outerHeight() - footerHeight);

		}
	});


	/*counter */
	$('.counter_block .text').val(1);

	$("body").delegate('.counter_block .text', 'load', function() {
		var value = 1;
		$('.counter_block .text').val(value);
	});
	$("body").delegate('.counter_block .text', 'click', function() {
		$(this).val("");
	});
	$('body').delegate('.counter_block .plus', 'click', function() {
		value = $(this).parent().siblings().val() * 1;
		value = $(this).parent().prev().val() * 1;

		if($(this).parent().parent().hasClass('meter'))
		{
			value = value + 0.01;
		}
		else
		{
			value = value + 1;
		}

		if (value > 100){
			value = 100;
		}
		$(this).parent().parent('.meter').children().siblings().val((value.toFixed(2)));
		$(this).parent().siblings().val(value);
	});

	$('body').delegate('.counter_block .minus', 'click', function() {
		value = $(this).parent().siblings().val() * 1;
		if($(this).parent().parent().hasClass('meter'))
		{
			value = value - 0.01;
			if (value < 0) {
				value = 0;
			}
		}
		else
		{
			value = value - 1;
			if (value < 1) {
				value = 1;
			}
		}
		$(this).parent().parent('.meter').children().siblings().val((value.toFixed(2)));
		$(this).parent().siblings().val(value);
	});



	$("body").delegate('.counter_block .text', 'blur', function() {
		if ($(this).val()=="" || $(this).val()=="0"){
			$(this).val("1");
		} else if ($(this).val()>"100"*1){
			$(this).val("100");
		}
	});

	/*tabs*/
	
	$('.item_tab_item').on('click', function() {
		var attrebut = $(this).attr('data-content');
		$('.item_tab_item').removeClass('active');
		$(this).addClass('active');
		$('.item_tab_content_block').hide();
		$('.item_tab_content').children('#'+attrebut).fadeIn('fast');
	});


	$('.add_new_form').on('click', function() {
		// var html = $('.form').html();
		// $('.phone').append('<div class="form "></div>');
		$('.form form input:last-child').clone().appendTo('.form form');
		$('.form form input:last-child').val('').mask('+7(999)999-99-99');
	});



	$('.fixed_header').hide()

	$(document).scroll(function() {
		if($(window).scrollTop()>=200){
			$('.fixed_header').slideDown('fast');
		}
		else
		{
			$('.fixed_header').slideUp('fast');		
		}
	});

	$("body").on("click",".ancor", function (event) {
		event.preventDefault();
		var id  = $(this).attr('href'),
		top = $(id).offset().top;
		$('body, html').animate({scrollTop: top}, 1000);
	});


	/*pop-up*/
	function offScroll() {
		var winScrollTop = $(window).scrollTop();
		$(window).bind('scroll', function() {
			$(window).scrollTop(winScrollTop);
		});
	};

	$('.popupBtn').on('click', function() {

		// console.log($(this).attr());

		var windowWidth = $(window).outerWidth(),
		windowHeight = $(window).outerHeight(),
		positionX = 0,
		positionY = 0,
		popupBtn = $(this),
		popupWin = $('.popupWindow');


		offScroll();

		var blockContent = $('.popup_container').children('[data-block="'+popupBtn.attr('data-content')+'"]').html();

		switch (popupBtn.attr('data-content'))
		{
			case "call_back":
			popupWin.addClass('problemsPopup');
			popupWin.addClass('reviews_popup');
			$('.reviews_popup_content').addClass('play_btn');
			popupWin.html(blockContent);
			break;	
			case "one_click_buy":
			popupWin.addClass('problemsPopup');
			popupWin.addClass('consultation_popup');
			popupWin.html(blockContent);
			break;	
		}

		var popupWidth = $('.popupWindow').outerWidth(),
		popupHeight = $('.popupWindow').outerHeight(),
		positionX = (windowWidth/2) - (popupWidth/2);
		positionY = (windowHeight/2) - (popupHeight/2);

		console.log(popupWidth);

		popupWin.css({'position': 'fixed', 'left': positionX, 'top': positionY});

		popupWin.fadeIn();
		popupWin.append('<div class="close_popup closePopup"><img src="img/close_icon.png" alt="" /></div>');

		$('#fade').fadeIn();

	});
	$('.closePopup, #fade').on('click', function() {
		$('.popupWindow, #fade').fadeOut('fast');
		$(window).unbind('scroll');
		setTimeout(function() {
			$('.popupWindow').removeClass('problemsPopup order_popup consultation_popup reviews_popup')
		}, 500);
	});
	$("body").delegate('.closePopup', 'click', function() {
		$('.popupWindow,  #fade').fadeOut();
		$(window).unbind('scroll');
		setTimeout(function() {
			$('.popupWindow').removeClass('problemsPopup order_popup consultation_popup reviews_popup')
		}, 500);
	});

	$("#lightgallery").lightGallery({
		selector: '.slider_for_item',
		showThumbByDefault: false,
		share: false,
		actualSize: false,
		autoplayControls: false,
		download: false
	}); 


	$('body').delegate('.popupBtn', 'click', function() {

		$('.popup_phone').mask('+7(999)999-99-99');
	});


	$('.phone_number').mask('+7(999)999-99-99');
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKSB7XHJcblx0JCgnLm1haW5fc2xpZGVyJykuc2xpY2soe1xyXG5cdFx0aW5maW5pdGU6IHRydWUsXHJcblx0XHRzbGlkZXNUb1Nob3c6IDEsXHJcblx0XHRzbGlkZXNUb1Njcm9sbDogMSxcclxuXHRcdGRvdHM6IHRydWUsXHJcblx0XHRhcnJvd3M6IHRydWVcclxuXHR9KTtcclxuXHJcblx0JCgnLnNhbGVfaGl0X3NsaWRlcicpLnNsaWNrKHtcclxuXHRcdGluZmluaXRlOiB0cnVlLFxyXG5cdFx0c2xpZGVzVG9TaG93OiA0LFxyXG5cdFx0c2xpZGVzVG9TY3JvbGw6IDEsXHJcblx0XHRkb3RzOiBmYWxzZSxcclxuXHRcdGFycm93czogdHJ1ZSxcclxuXHRcdC8vIGNlbnRlck1vZGU6IHRydWUsXHJcblx0XHR2YXJpYWJsZVdpZHRoOiB0cnVlLFxyXG5cdFx0cmVzcG9uc2l2ZTogW1xyXG5cdFx0e1xyXG5cdFx0XHRicmVha3BvaW50OiAxNDIwLFxyXG5cdFx0XHRzZXR0aW5nczoge1xyXG5cdFx0XHRcdGNlbnRlck1vZGU6IHRydWUsXHJcblx0XHRcdFx0Y2VudGVyUGFkZGluZzogJzQwcHgnLFxyXG5cdFx0XHR9XHJcblx0XHR9XVxyXG5cdH0pO1xyXG5cclxuXHQkKCcuYnJhbmRfc2xpZGVyJykuc2xpY2soe1xyXG5cdFx0Y2VudGVyTW9kZTogdHJ1ZSxcclxuXHRcdGluZmluaXRlOiB0cnVlLFxyXG5cdFx0c2xpZGVzVG9TaG93OiAzLFxyXG5cdFx0c2xpZGVzVG9TY3JvbGw6IDEsXHJcblx0XHRkb3RzOiBmYWxzZSxcclxuXHRcdHZhcmlhYmxlV2lkdGg6IHRydWUsXHJcblx0XHRhcnJvd3M6IHRydWVcclxuXHR9KTtcclxuXHJcblxyXG5cdC8qaXRlbSBzbGlkZXIqL1xyXG5cdCQoJy5zbGlkZXItZm9yJykuc2xpY2soe1xyXG5cdFx0c2xpZGVzVG9TaG93OiAxLFxyXG5cdFx0c2xpZGVzVG9TY3JvbGw6IDEsXHJcblx0XHRpbmZpbml0ZTogdHJ1ZSxcclxuXHRcdGFycm93czogZmFsc2UsXHJcblx0XHRmYWRlOiB0cnVlLFxyXG5cdFx0YXNOYXZGb3I6ICcuc2xpZGVyLW5hdidcclxuXHR9KTtcclxuXHQkKCcuc2xpZGVyLW5hdicpLnNsaWNrKHtcclxuXHRcdHNsaWRlc1RvU2hvdzogNCxcclxuXHRcdGluZmluaXRlOiB0cnVlLFxyXG5cdFx0c2xpZGVzVG9TY3JvbGw6IDEsXHJcblx0XHRhc05hdkZvcjogJy5zbGlkZXItZm9yJyxcclxuXHRcdGRvdHM6IGZhbHNlLFxyXG5cdFx0YXJyb3dzOiB0cnVlLFx0XHJcblx0XHQvLyBjZW50ZXJNb2RlOiB0cnVlLFxyXG5cdFx0Zm9jdXNPblNlbGVjdDogdHJ1ZVxyXG5cclxuXHR9KTtcclxuXHJcblxyXG5cdCQoJy50b3BfbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0JCh0aGlzKS5uZXh0KCcuc2Vjb25kX21lbnUnKS5zbGlkZVRvZ2dsZSgpO1xyXG5cdH0pO1xyXG5cclxuXHQkKCcuaGVhZGVyX21lbnVfYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHQkKCcuaGVhZGVyX21lbnVfbGlzdCcpLnNsaWRlVG9nZ2xlKCk7XHJcblx0fSk7XHJcblxyXG5cdCQoJy5hc2lkZV9idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdCQoJy5hc2lkZV9ibG9jaycpLnNsaWRlVG9nZ2xlKCk7XHJcblx0fSk7XHJcblxyXG5cdCQod2luZG93KS5vbignbG9hZCByZXNpemUnLCBmdW5jdGlvbigpIHtcclxuXHRcdHZhciB3aW5kb3dXaWR0aCA9ICQod2luZG93KS5pbm5lcldpZHRoKCk7XHJcblx0XHRpZih3aW5kb3dXaWR0aCA8IDk5MSlcclxuXHRcdHtcclxuXHRcdFx0JCgnLmhlYWRlcl9tZW51X2xpc3QnKS5yZW1vdmVBdHRyKCdzdHlsZScpO1xyXG5cdFx0fVxyXG5cdFx0aWYod2luZG93V2lkdGggPCA4NjUpXHJcblx0XHR7XHJcblx0XHRcdCQoJy5hc2lkZV9jb250YWluZXInKS5yZW1vdmVBdHRyKCdzdHlsZScpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHQkKHdpbmRvdykub24oJ2xvYWQgcmVzaXplJywgZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgaGVhZGVySGVpZ2h0ID0gJCgnaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcclxuXHRcdHZhciBmb290ZXJIZWlnaHQgPSAkKCdmb290ZXInKS5vdXRlckhlaWdodCh0cnVlKTtcclxuXHRcdHZhciBjb250ZW50SGVpZ2h0ID0gJCgnLm1haW5fY29udGFpbmVyJykub3V0ZXJIZWlnaHQoKTtcclxuXHRcdHZhciBhc2lkZUhlaWdodCA9ICQoJy5hc2lkZV9jb250YWluZXInKS5vdXRlckhlaWdodCgpO1xyXG5cclxuXHJcblx0XHRpZihjb250ZW50SGVpZ2h0IDwgKGFzaWRlSGVpZ2h0KSlcclxuXHRcdHtcclxuXHRcdFx0JCgnLm1haW5fY29udGFpbmVyJykub3V0ZXJIZWlnaHQoYXNpZGVIZWlnaHQgLSAxMDApO1xyXG5cdFx0fVxyXG5cdFx0aWYoJCgnLmFzaWRlX2NvbnRhaW5lcicpLmxlbmd0aCA9PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHQkKCcubWFpbl9jb250YWluZXInKS5vdXRlckhlaWdodCgkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSAtIGhlYWRlckhlaWdodCAtICQoJy5oZWFkZXJfbWVudScpLm91dGVySGVpZ2h0KCkgLSBmb290ZXJIZWlnaHQpO1xyXG5cclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblxyXG5cdC8qY291bnRlciAqL1xyXG5cdCQoJy5jb3VudGVyX2Jsb2NrIC50ZXh0JykudmFsKDEpO1xyXG5cclxuXHQkKFwiYm9keVwiKS5kZWxlZ2F0ZSgnLmNvdW50ZXJfYmxvY2sgLnRleHQnLCAnbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHZhbHVlID0gMTtcclxuXHRcdCQoJy5jb3VudGVyX2Jsb2NrIC50ZXh0JykudmFsKHZhbHVlKTtcclxuXHR9KTtcclxuXHQkKFwiYm9keVwiKS5kZWxlZ2F0ZSgnLmNvdW50ZXJfYmxvY2sgLnRleHQnLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcykudmFsKFwiXCIpO1xyXG5cdH0pO1xyXG5cdCQoJ2JvZHknKS5kZWxlZ2F0ZSgnLmNvdW50ZXJfYmxvY2sgLnBsdXMnLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdHZhbHVlID0gJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnZhbCgpICogMTtcclxuXHRcdHZhbHVlID0gJCh0aGlzKS5wYXJlbnQoKS5wcmV2KCkudmFsKCkgKiAxO1xyXG5cclxuXHRcdGlmKCQodGhpcykucGFyZW50KCkucGFyZW50KCkuaGFzQ2xhc3MoJ21ldGVyJykpXHJcblx0XHR7XHJcblx0XHRcdHZhbHVlID0gdmFsdWUgKyAwLjAxO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR2YWx1ZSA9IHZhbHVlICsgMTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodmFsdWUgPiAxMDApe1xyXG5cdFx0XHR2YWx1ZSA9IDEwMDtcclxuXHRcdH1cclxuXHRcdCQodGhpcykucGFyZW50KCkucGFyZW50KCcubWV0ZXInKS5jaGlsZHJlbigpLnNpYmxpbmdzKCkudmFsKCh2YWx1ZS50b0ZpeGVkKDIpKSk7XHJcblx0XHQkKHRoaXMpLnBhcmVudCgpLnNpYmxpbmdzKCkudmFsKHZhbHVlKTtcclxuXHR9KTtcclxuXHJcblx0JCgnYm9keScpLmRlbGVnYXRlKCcuY291bnRlcl9ibG9jayAubWludXMnLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdHZhbHVlID0gJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnZhbCgpICogMTtcclxuXHRcdGlmKCQodGhpcykucGFyZW50KCkucGFyZW50KCkuaGFzQ2xhc3MoJ21ldGVyJykpXHJcblx0XHR7XHJcblx0XHRcdHZhbHVlID0gdmFsdWUgLSAwLjAxO1xyXG5cdFx0XHRpZiAodmFsdWUgPCAwKSB7XHJcblx0XHRcdFx0dmFsdWUgPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHZhbHVlID0gdmFsdWUgLSAxO1xyXG5cdFx0XHRpZiAodmFsdWUgPCAxKSB7XHJcblx0XHRcdFx0dmFsdWUgPSAxO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgnLm1ldGVyJykuY2hpbGRyZW4oKS5zaWJsaW5ncygpLnZhbCgodmFsdWUudG9GaXhlZCgyKSkpO1xyXG5cdFx0JCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLnZhbCh2YWx1ZSk7XHJcblx0fSk7XHJcblxyXG5cclxuXHJcblx0JChcImJvZHlcIikuZGVsZWdhdGUoJy5jb3VudGVyX2Jsb2NrIC50ZXh0JywgJ2JsdXInLCBmdW5jdGlvbigpIHtcclxuXHRcdGlmICgkKHRoaXMpLnZhbCgpPT1cIlwiIHx8ICQodGhpcykudmFsKCk9PVwiMFwiKXtcclxuXHRcdFx0JCh0aGlzKS52YWwoXCIxXCIpO1xyXG5cdFx0fSBlbHNlIGlmICgkKHRoaXMpLnZhbCgpPlwiMTAwXCIqMSl7XHJcblx0XHRcdCQodGhpcykudmFsKFwiMTAwXCIpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHQvKnRhYnMqL1xyXG5cdFxyXG5cdCQoJy5pdGVtX3RhYl9pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgYXR0cmVidXQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtY29udGVudCcpO1xyXG5cdFx0JCgnLml0ZW1fdGFiX2l0ZW0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdCQoJy5pdGVtX3RhYl9jb250ZW50X2Jsb2NrJykuaGlkZSgpO1xyXG5cdFx0JCgnLml0ZW1fdGFiX2NvbnRlbnQnKS5jaGlsZHJlbignIycrYXR0cmVidXQpLmZhZGVJbignZmFzdCcpO1xyXG5cdH0pO1xyXG5cclxuXHJcblx0JCgnLmFkZF9uZXdfZm9ybScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gdmFyIGh0bWwgPSAkKCcuZm9ybScpLmh0bWwoKTtcclxuXHRcdC8vICQoJy5waG9uZScpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImZvcm0gXCI+PC9kaXY+Jyk7XHJcblx0XHQkKCcuZm9ybSBmb3JtIGlucHV0Omxhc3QtY2hpbGQnKS5jbG9uZSgpLmFwcGVuZFRvKCcuZm9ybSBmb3JtJyk7XHJcblx0XHQkKCcuZm9ybSBmb3JtIGlucHV0Omxhc3QtY2hpbGQnKS52YWwoJycpLm1hc2soJys3KDk5OSk5OTktOTktOTknKTtcclxuXHR9KTtcclxuXHJcblxyXG5cclxuXHQkKCcuZml4ZWRfaGVhZGVyJykuaGlkZSgpXHJcblxyXG5cdCQoZG9jdW1lbnQpLnNjcm9sbChmdW5jdGlvbigpIHtcclxuXHRcdGlmKCQod2luZG93KS5zY3JvbGxUb3AoKT49MjAwKXtcclxuXHRcdFx0JCgnLmZpeGVkX2hlYWRlcicpLnNsaWRlRG93bignZmFzdCcpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHQkKCcuZml4ZWRfaGVhZGVyJykuc2xpZGVVcCgnZmFzdCcpO1x0XHRcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0JChcImJvZHlcIikub24oXCJjbGlja1wiLFwiLmFuY29yXCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdHZhciBpZCAgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKSxcclxuXHRcdHRvcCA9ICQoaWQpLm9mZnNldCgpLnRvcDtcclxuXHRcdCQoJ2JvZHksIGh0bWwnKS5hbmltYXRlKHtzY3JvbGxUb3A6IHRvcH0sIDEwMDApO1xyXG5cdH0pO1xyXG5cclxuXHJcblx0Lypwb3AtdXAqL1xyXG5cdGZ1bmN0aW9uIG9mZlNjcm9sbCgpIHtcclxuXHRcdHZhciB3aW5TY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcblx0XHQkKHdpbmRvdykuYmluZCgnc2Nyb2xsJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQod2luZG93KS5zY3JvbGxUb3Aod2luU2Nyb2xsVG9wKTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblxyXG5cdCQoJy5wb3B1cEJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdC8vIGNvbnNvbGUubG9nKCQodGhpcykuYXR0cigpKTtcclxuXHJcblx0XHR2YXIgd2luZG93V2lkdGggPSAkKHdpbmRvdykub3V0ZXJXaWR0aCgpLFxyXG5cdFx0d2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLm91dGVySGVpZ2h0KCksXHJcblx0XHRwb3NpdGlvblggPSAwLFxyXG5cdFx0cG9zaXRpb25ZID0gMCxcclxuXHRcdHBvcHVwQnRuID0gJCh0aGlzKSxcclxuXHRcdHBvcHVwV2luID0gJCgnLnBvcHVwV2luZG93Jyk7XHJcblxyXG5cclxuXHRcdG9mZlNjcm9sbCgpO1xyXG5cclxuXHRcdHZhciBibG9ja0NvbnRlbnQgPSAkKCcucG9wdXBfY29udGFpbmVyJykuY2hpbGRyZW4oJ1tkYXRhLWJsb2NrPVwiJytwb3B1cEJ0bi5hdHRyKCdkYXRhLWNvbnRlbnQnKSsnXCJdJykuaHRtbCgpO1xyXG5cclxuXHRcdHN3aXRjaCAocG9wdXBCdG4uYXR0cignZGF0YS1jb250ZW50JykpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJjYWxsX2JhY2tcIjpcclxuXHRcdFx0cG9wdXBXaW4uYWRkQ2xhc3MoJ3Byb2JsZW1zUG9wdXAnKTtcclxuXHRcdFx0cG9wdXBXaW4uYWRkQ2xhc3MoJ3Jldmlld3NfcG9wdXAnKTtcclxuXHRcdFx0JCgnLnJldmlld3NfcG9wdXBfY29udGVudCcpLmFkZENsYXNzKCdwbGF5X2J0bicpO1xyXG5cdFx0XHRwb3B1cFdpbi5odG1sKGJsb2NrQ29udGVudCk7XHJcblx0XHRcdGJyZWFrO1x0XHJcblx0XHRcdGNhc2UgXCJvbmVfY2xpY2tfYnV5XCI6XHJcblx0XHRcdHBvcHVwV2luLmFkZENsYXNzKCdwcm9ibGVtc1BvcHVwJyk7XHJcblx0XHRcdHBvcHVwV2luLmFkZENsYXNzKCdjb25zdWx0YXRpb25fcG9wdXAnKTtcclxuXHRcdFx0cG9wdXBXaW4uaHRtbChibG9ja0NvbnRlbnQpO1xyXG5cdFx0XHRicmVhaztcdFxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBwb3B1cFdpZHRoID0gJCgnLnBvcHVwV2luZG93Jykub3V0ZXJXaWR0aCgpLFxyXG5cdFx0cG9wdXBIZWlnaHQgPSAkKCcucG9wdXBXaW5kb3cnKS5vdXRlckhlaWdodCgpLFxyXG5cdFx0cG9zaXRpb25YID0gKHdpbmRvd1dpZHRoLzIpIC0gKHBvcHVwV2lkdGgvMik7XHJcblx0XHRwb3NpdGlvblkgPSAod2luZG93SGVpZ2h0LzIpIC0gKHBvcHVwSGVpZ2h0LzIpO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKHBvcHVwV2lkdGgpO1xyXG5cclxuXHRcdHBvcHVwV2luLmNzcyh7J3Bvc2l0aW9uJzogJ2ZpeGVkJywgJ2xlZnQnOiBwb3NpdGlvblgsICd0b3AnOiBwb3NpdGlvbll9KTtcclxuXHJcblx0XHRwb3B1cFdpbi5mYWRlSW4oKTtcclxuXHRcdHBvcHVwV2luLmFwcGVuZCgnPGRpdiBjbGFzcz1cImNsb3NlX3BvcHVwIGNsb3NlUG9wdXBcIj48aW1nIHNyYz1cImltZy9jbG9zZV9pY29uLnBuZ1wiIGFsdD1cIlwiIC8+PC9kaXY+Jyk7XHJcblxyXG5cdFx0JCgnI2ZhZGUnKS5mYWRlSW4oKTtcclxuXHJcblx0fSk7XHJcblx0JCgnLmNsb3NlUG9wdXAsICNmYWRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHQkKCcucG9wdXBXaW5kb3csICNmYWRlJykuZmFkZU91dCgnZmFzdCcpO1xyXG5cdFx0JCh3aW5kb3cpLnVuYmluZCgnc2Nyb2xsJyk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkKCcucG9wdXBXaW5kb3cnKS5yZW1vdmVDbGFzcygncHJvYmxlbXNQb3B1cCBvcmRlcl9wb3B1cCBjb25zdWx0YXRpb25fcG9wdXAgcmV2aWV3c19wb3B1cCcpXHJcblx0XHR9LCA1MDApO1xyXG5cdH0pO1xyXG5cdCQoXCJib2R5XCIpLmRlbGVnYXRlKCcuY2xvc2VQb3B1cCcsICdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0JCgnLnBvcHVwV2luZG93LCAgI2ZhZGUnKS5mYWRlT3V0KCk7XHJcblx0XHQkKHdpbmRvdykudW5iaW5kKCdzY3JvbGwnKTtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoJy5wb3B1cFdpbmRvdycpLnJlbW92ZUNsYXNzKCdwcm9ibGVtc1BvcHVwIG9yZGVyX3BvcHVwIGNvbnN1bHRhdGlvbl9wb3B1cCByZXZpZXdzX3BvcHVwJylcclxuXHRcdH0sIDUwMCk7XHJcblx0fSk7XHJcblxyXG5cdCQoXCIjbGlnaHRnYWxsZXJ5XCIpLmxpZ2h0R2FsbGVyeSh7XHJcblx0XHRzZWxlY3RvcjogJy5zbGlkZXJfZm9yX2l0ZW0nLFxyXG5cdFx0c2hvd1RodW1iQnlEZWZhdWx0OiBmYWxzZSxcclxuXHRcdHNoYXJlOiBmYWxzZSxcclxuXHRcdGFjdHVhbFNpemU6IGZhbHNlLFxyXG5cdFx0YXV0b3BsYXlDb250cm9sczogZmFsc2UsXHJcblx0XHRkb3dubG9hZDogZmFsc2VcclxuXHR9KTsgXHJcblxyXG5cclxuXHQkKCdib2R5JykuZGVsZWdhdGUoJy5wb3B1cEJ0bicsICdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdCQoJy5wb3B1cF9waG9uZScpLm1hc2soJys3KDk5OSk5OTktOTktOTknKTtcclxuXHR9KTtcclxuXHJcblxyXG5cdCQoJy5waG9uZV9udW1iZXInKS5tYXNrKCcrNyg5OTkpOTk5LTk5LTk5Jyk7XHJcbn0pOyJdLCJmaWxlIjoibWFpbi5qcyJ9
