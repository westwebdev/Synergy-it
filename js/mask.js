(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

var ua = navigator.userAgent,
	iPhone = /iphone/i.test(ua),
	chrome = /chrome/i.test(ua),
	android = /android/i.test(ua),
	caretTimeoutId;

$.mask = {
	//Predefined character definitions
	definitions: {
		'9': "[0-9]",
		'a': "[A-Za-z]",
		'*': "[A-Za-z0-9]"
	},
	autoclear: true,
	dataName: "rawMaskFn",
	placeholder: '_'
};

$.fn.extend({
	//Helper Function for Caret positioning
	caret: function(begin, end) {
		var range;

		if (this.length === 0 || this.is(":hidden") || this.get(0) !== document.activeElement) {
			return;
		}

		if (typeof begin == 'number') {
			end = (typeof end === 'number') ? end : begin;
			return this.each(function() {
				if (this.setSelectionRange) {
					this.setSelectionRange(begin, end);
				} else if (this.createTextRange) {
					range = this.createTextRange();
					range.collapse(true);
					range.moveEnd('character', end);
					range.moveStart('character', begin);
					range.select();
				}
			});
		} else {
			if (this[0].setSelectionRange) {
				begin = this[0].selectionStart;
				end = this[0].selectionEnd;
			} else if (document.selection && document.selection.createRange) {
				range = document.selection.createRange();
				begin = 0 - range.duplicate().moveStart('character', -100000);
				end = begin + range.text.length;
			}
			return { begin: begin, end: end };
		}
	},
	unmask: function() {
		return this.trigger("unmask");
	},
	mask: function(mask, settings) {
		var input,
			defs,
			tests,
			partialPosition,
			firstNonMaskPos,
            lastRequiredNonMaskPos,
            len,
            oldVal;

		if (!mask && this.length > 0) {
			input = $(this[0]);
            var fn = input.data($.mask.dataName)
			return fn?fn():undefined;
		}

		settings = $.extend({
			autoclear: $.mask.autoclear,
			placeholder: $.mask.placeholder, // Load default placeholder
			completed: null
		}, settings);


		defs = $.mask.definitions;
		tests = [];
		partialPosition = len = mask.length;
		firstNonMaskPos = null;

		mask = String(mask);

		$.each(mask.split(""), function(i, c) {
			if (c == '?') {
				len--;
				partialPosition = i;
			} else if (defs[c]) {
				tests.push(new RegExp(defs[c]));
				if (firstNonMaskPos === null) {
					firstNonMaskPos = tests.length - 1;
				}
                if(i < partialPosition){
                    lastRequiredNonMaskPos = tests.length - 1;
                }
			} else {
				tests.push(null);
			}
		});

		return this.trigger("unmask").each(function() {
			var input = $(this),
				buffer = $.map(
    				mask.split(""),
    				function(c, i) {
    					if (c != '?') {
    						return defs[c] ? getPlaceholder(i) : c;
    					}
    				}),
				defaultBuffer = buffer.join(''),
				focusText = input.val();

            function tryFireCompleted(){
                if (!settings.completed) {
                    return;
                }

                for (var i = firstNonMaskPos; i <= lastRequiredNonMaskPos; i++) {
                    if (tests[i] && buffer[i] === getPlaceholder(i)) {
                        return;
                    }
                }
                settings.completed.call(input);
            }

            function getPlaceholder(i){
                if(i < settings.placeholder.length)
                    return settings.placeholder.charAt(i);
                return settings.placeholder.charAt(0);
            }

			function seekNext(pos) {
				while (++pos < len && !tests[pos]);
				return pos;
			}

			function seekPrev(pos) {
				while (--pos >= 0 && !tests[pos]);
				return pos;
			}

			function shiftL(begin,end) {
				var i,
					j;

				if (begin<0) {
					return;
				}

				for (i = begin, j = seekNext(end); i < len; i++) {
					if (tests[i]) {
						if (j < len && tests[i].test(buffer[j])) {
							buffer[i] = buffer[j];
							buffer[j] = getPlaceholder(j);
						} else {
							break;
						}

						j = seekNext(j);
					}
				}
				writeBuffer();
				input.caret(Math.max(firstNonMaskPos, begin));
			}

			function shiftR(pos) {
				var i,
					c,
					j,
					t;

				for (i = pos, c = getPlaceholder(pos); i < len; i++) {
					if (tests[i]) {
						j = seekNext(i);
						t = buffer[i];
						buffer[i] = c;
						if (j < len && tests[j].test(t)) {
							c = t;
						} else {
							break;
						}
					}
				}
			}

			function androidInputEvent(e) {
				var curVal = input.val();
				var pos = input.caret();
				if (oldVal && oldVal.length && oldVal.length > curVal.length ) {
					// a deletion or backspace happened
					checkVal(true);
					while (pos.begin > 0 && !tests[pos.begin-1])
						pos.begin--;
					if (pos.begin === 0)
					{
						while (pos.begin < firstNonMaskPos && !tests[pos.begin])
							pos.begin++;
					}
					input.caret(pos.begin,pos.begin);
				} else {
					var pos2 = checkVal(true);
					var lastEnteredValue = curVal.charAt(pos.begin);
					if (pos.begin < len){
						if(!tests[pos.begin]){
							pos.begin++;
							if(tests[pos.begin].test(lastEnteredValue)){
								pos.begin++;
							}
						}else{
							if(tests[pos.begin].test(lastEnteredValue)){
								pos.begin++;
							}
						}
					}
					input.caret(pos.begin,pos.begin);
				}
				tryFireCompleted();
			}


			function blurEvent(e) {
                checkVal();

                if (input.val() != focusText)
                    input.change();
            }

			function keydownEvent(e) {
                if (input.prop("readonly")){
                    return;
                }

				var k = e.which || e.keyCode,
					pos,
					begin,
					end;
                    oldVal = input.val();
				//backspace, delete, and escape get special treatment
				if (k === 8 || k === 46 || (iPhone && k === 127)) {
					pos = input.caret();
					begin = pos.begin;
					end = pos.end;

					if (end - begin === 0) {
						begin=k!==46?seekPrev(begin):(end=seekNext(begin-1));
						end=k===46?seekNext(end):end;
					}
					clearBuffer(begin, end);
					shiftL(begin, end - 1);

					e.preventDefault();
				} else if( k === 13 ) { // enter
					blurEvent.call(this, e);
				} else if (k === 27) { // escape
					input.val(focusText);
					input.caret(0, checkVal());
					e.preventDefault();
				}
			}

			function keypressEvent(e) {
                if (input.prop("readonly")){
                    return;
                }

				var k = e.which || e.keyCode,
					pos = input.caret(),
					p,
					c,
					next;

				if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
					return;
				} else if ( k && k !== 13 ) {
					if (pos.end - pos.begin !== 0){
						clearBuffer(pos.begin, pos.end);
						shiftL(pos.begin, pos.end-1);
					}

					p = seekNext(pos.begin - 1);
					if (p < len) {
						c = String.fromCharCode(k);
						if (tests[p].test(c)) {
							shiftR(p);

							buffer[p] = c;
							writeBuffer();
							next = seekNext(p);

							if(android){
								//Path for CSP Violation on FireFox OS 1.1
								var proxy = function() {
									$.proxy($.fn.caret,input,next)();
								};

								setTimeout(proxy,0);
							}else{
								input.caret(next);
							}
                            if(pos.begin <= lastRequiredNonMaskPos){
		                         tryFireCompleted();
                             }
						}
					}
					e.preventDefault();
				}
			}

			function clearBuffer(start, end) {
				var i;
				for (i = start; i < end && i < len; i++) {
					if (tests[i]) {
						buffer[i] = getPlaceholder(i);
					}
				}
			}

			function writeBuffer() { input.val(buffer.join('')); }

			function checkVal(allow) {
				//try to place characters where they belong
				var test = input.val(),
					lastMatch = -1,
					i,
					c,
					pos;

				for (i = 0, pos = 0; i < len; i++) {
					if (tests[i]) {
						buffer[i] = getPlaceholder(i);
						while (pos++ < test.length) {
							c = test.charAt(pos - 1);
							if (tests[i].test(c)) {
								buffer[i] = c;
								lastMatch = i;
								break;
							}
						}
						if (pos > test.length) {
							clearBuffer(i + 1, len);
							break;
						}
					} else {
                        if (buffer[i] === test.charAt(pos)) {
                            pos++;
                        }
                        if( i < partialPosition){
                            lastMatch = i;
                        }
					}
				}
				if (allow) {
					writeBuffer();
				} else if (lastMatch + 1 < partialPosition) {
					if (settings.autoclear || buffer.join('') === defaultBuffer) {
						// Invalid value. Remove it and replace it with the
						// mask, which is the default behavior.
						if(input.val()) input.val("");
						clearBuffer(0, len);
					} else {
						// Invalid value, but we opt to show the value to the
						// user and allow them to correct their mistake.
						writeBuffer();
					}
				} else {
					writeBuffer();
					input.val(input.val().substring(0, lastMatch + 1));
				}
				return (partialPosition ? i : firstNonMaskPos);
			}

			input.data($.mask.dataName,function(){
				return $.map(buffer, function(c, i) {
					return tests[i]&&c!=getPlaceholder(i) ? c : null;
				}).join('');
			});


			input
				.one("unmask", function() {
					input
						.off(".mask")
						.removeData($.mask.dataName);
				})
				.on("focus.mask", function() {
                    if (input.prop("readonly")){
                        return;
                    }

					clearTimeout(caretTimeoutId);
					var pos;

					focusText = input.val();

					pos = checkVal();

					caretTimeoutId = setTimeout(function(){
                        if(input.get(0) !== document.activeElement){
                            return;
                        }
						writeBuffer();
						if (pos == mask.replace("?","").length) {
							input.caret(0, pos);
						} else {
							input.caret(pos);
						}
					}, 10);
				})
				.on("blur.mask", blurEvent)
				.on("keydown.mask", keydownEvent)
				.on("keypress.mask", keypressEvent)
				.on("input.mask paste.mask", function() {
                    if (input.prop("readonly")){
                        return;
                    }

					setTimeout(function() {
						var pos=checkVal(true);
						input.caret(pos);
                        tryFireCompleted();
					}, 0);
				});
                if (chrome && android)
                {
                    input
                        .off('input.mask')
                        .on('input.mask', androidInputEvent);
                }
				checkVal(); //Perform initial check for existing values
		});
	}
});
}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIC8vIE5vZGUvQ29tbW9uSlNcclxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xyXG4gICAgfVxyXG59KGZ1bmN0aW9uICgkKSB7XHJcblxyXG52YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LFxyXG5cdGlQaG9uZSA9IC9pcGhvbmUvaS50ZXN0KHVhKSxcclxuXHRjaHJvbWUgPSAvY2hyb21lL2kudGVzdCh1YSksXHJcblx0YW5kcm9pZCA9IC9hbmRyb2lkL2kudGVzdCh1YSksXHJcblx0Y2FyZXRUaW1lb3V0SWQ7XHJcblxyXG4kLm1hc2sgPSB7XHJcblx0Ly9QcmVkZWZpbmVkIGNoYXJhY3RlciBkZWZpbml0aW9uc1xyXG5cdGRlZmluaXRpb25zOiB7XHJcblx0XHQnOSc6IFwiWzAtOV1cIixcclxuXHRcdCdhJzogXCJbQS1aYS16XVwiLFxyXG5cdFx0JyonOiBcIltBLVphLXowLTldXCJcclxuXHR9LFxyXG5cdGF1dG9jbGVhcjogdHJ1ZSxcclxuXHRkYXRhTmFtZTogXCJyYXdNYXNrRm5cIixcclxuXHRwbGFjZWhvbGRlcjogJ18nXHJcbn07XHJcblxyXG4kLmZuLmV4dGVuZCh7XHJcblx0Ly9IZWxwZXIgRnVuY3Rpb24gZm9yIENhcmV0IHBvc2l0aW9uaW5nXHJcblx0Y2FyZXQ6IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcclxuXHRcdHZhciByYW5nZTtcclxuXHJcblx0XHRpZiAodGhpcy5sZW5ndGggPT09IDAgfHwgdGhpcy5pcyhcIjpoaWRkZW5cIikgfHwgdGhpcy5nZXQoMCkgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0eXBlb2YgYmVnaW4gPT0gJ251bWJlcicpIHtcclxuXHRcdFx0ZW5kID0gKHR5cGVvZiBlbmQgPT09ICdudW1iZXInKSA/IGVuZCA6IGJlZ2luO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmICh0aGlzLnNldFNlbGVjdGlvblJhbmdlKSB7XHJcblx0XHRcdFx0XHR0aGlzLnNldFNlbGVjdGlvblJhbmdlKGJlZ2luLCBlbmQpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuXHRcdFx0XHRcdHJhbmdlID0gdGhpcy5jcmVhdGVUZXh0UmFuZ2UoKTtcclxuXHRcdFx0XHRcdHJhbmdlLmNvbGxhcHNlKHRydWUpO1xyXG5cdFx0XHRcdFx0cmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgZW5kKTtcclxuXHRcdFx0XHRcdHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgYmVnaW4pO1xyXG5cdFx0XHRcdFx0cmFuZ2Uuc2VsZWN0KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICh0aGlzWzBdLnNldFNlbGVjdGlvblJhbmdlKSB7XHJcblx0XHRcdFx0YmVnaW4gPSB0aGlzWzBdLnNlbGVjdGlvblN0YXJ0O1xyXG5cdFx0XHRcdGVuZCA9IHRoaXNbMF0uc2VsZWN0aW9uRW5kO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGRvY3VtZW50LnNlbGVjdGlvbiAmJiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UpIHtcclxuXHRcdFx0XHRyYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xyXG5cdFx0XHRcdGJlZ2luID0gMCAtIHJhbmdlLmR1cGxpY2F0ZSgpLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLTEwMDAwMCk7XHJcblx0XHRcdFx0ZW5kID0gYmVnaW4gKyByYW5nZS50ZXh0Lmxlbmd0aDtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4geyBiZWdpbjogYmVnaW4sIGVuZDogZW5kIH07XHJcblx0XHR9XHJcblx0fSxcclxuXHR1bm1hc2s6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlcihcInVubWFza1wiKTtcclxuXHR9LFxyXG5cdG1hc2s6IGZ1bmN0aW9uKG1hc2ssIHNldHRpbmdzKSB7XHJcblx0XHR2YXIgaW5wdXQsXHJcblx0XHRcdGRlZnMsXHJcblx0XHRcdHRlc3RzLFxyXG5cdFx0XHRwYXJ0aWFsUG9zaXRpb24sXHJcblx0XHRcdGZpcnN0Tm9uTWFza1BvcyxcclxuICAgICAgICAgICAgbGFzdFJlcXVpcmVkTm9uTWFza1BvcyxcclxuICAgICAgICAgICAgbGVuLFxyXG4gICAgICAgICAgICBvbGRWYWw7XHJcblxyXG5cdFx0aWYgKCFtYXNrICYmIHRoaXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRpbnB1dCA9ICQodGhpc1swXSk7XHJcbiAgICAgICAgICAgIHZhciBmbiA9IGlucHV0LmRhdGEoJC5tYXNrLmRhdGFOYW1lKVxyXG5cdFx0XHRyZXR1cm4gZm4/Zm4oKTp1bmRlZmluZWQ7XHJcblx0XHR9XHJcblxyXG5cdFx0c2V0dGluZ3MgPSAkLmV4dGVuZCh7XHJcblx0XHRcdGF1dG9jbGVhcjogJC5tYXNrLmF1dG9jbGVhcixcclxuXHRcdFx0cGxhY2Vob2xkZXI6ICQubWFzay5wbGFjZWhvbGRlciwgLy8gTG9hZCBkZWZhdWx0IHBsYWNlaG9sZGVyXHJcblx0XHRcdGNvbXBsZXRlZDogbnVsbFxyXG5cdFx0fSwgc2V0dGluZ3MpO1xyXG5cclxuXHJcblx0XHRkZWZzID0gJC5tYXNrLmRlZmluaXRpb25zO1xyXG5cdFx0dGVzdHMgPSBbXTtcclxuXHRcdHBhcnRpYWxQb3NpdGlvbiA9IGxlbiA9IG1hc2subGVuZ3RoO1xyXG5cdFx0Zmlyc3ROb25NYXNrUG9zID0gbnVsbDtcclxuXHJcblx0XHRtYXNrID0gU3RyaW5nKG1hc2spO1xyXG5cclxuXHRcdCQuZWFjaChtYXNrLnNwbGl0KFwiXCIpLCBmdW5jdGlvbihpLCBjKSB7XHJcblx0XHRcdGlmIChjID09ICc/Jykge1xyXG5cdFx0XHRcdGxlbi0tO1xyXG5cdFx0XHRcdHBhcnRpYWxQb3NpdGlvbiA9IGk7XHJcblx0XHRcdH0gZWxzZSBpZiAoZGVmc1tjXSkge1xyXG5cdFx0XHRcdHRlc3RzLnB1c2gobmV3IFJlZ0V4cChkZWZzW2NdKSk7XHJcblx0XHRcdFx0aWYgKGZpcnN0Tm9uTWFza1BvcyA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0Zmlyc3ROb25NYXNrUG9zID0gdGVzdHMubGVuZ3RoIC0gMTtcclxuXHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICBpZihpIDwgcGFydGlhbFBvc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0UmVxdWlyZWROb25NYXNrUG9zID0gdGVzdHMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0ZXN0cy5wdXNoKG51bGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyKFwidW5tYXNrXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBpbnB1dCA9ICQodGhpcyksXHJcblx0XHRcdFx0YnVmZmVyID0gJC5tYXAoXHJcbiAgICBcdFx0XHRcdG1hc2suc3BsaXQoXCJcIiksXHJcbiAgICBcdFx0XHRcdGZ1bmN0aW9uKGMsIGkpIHtcclxuICAgIFx0XHRcdFx0XHRpZiAoYyAhPSAnPycpIHtcclxuICAgIFx0XHRcdFx0XHRcdHJldHVybiBkZWZzW2NdID8gZ2V0UGxhY2Vob2xkZXIoaSkgOiBjO1xyXG4gICAgXHRcdFx0XHRcdH1cclxuICAgIFx0XHRcdFx0fSksXHJcblx0XHRcdFx0ZGVmYXVsdEJ1ZmZlciA9IGJ1ZmZlci5qb2luKCcnKSxcclxuXHRcdFx0XHRmb2N1c1RleHQgPSBpbnB1dC52YWwoKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRyeUZpcmVDb21wbGV0ZWQoKXtcclxuICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MuY29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBmaXJzdE5vbk1hc2tQb3M7IGkgPD0gbGFzdFJlcXVpcmVkTm9uTWFza1BvczsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RzW2ldICYmIGJ1ZmZlcltpXSA9PT0gZ2V0UGxhY2Vob2xkZXIoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmNvbXBsZXRlZC5jYWxsKGlucHV0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UGxhY2Vob2xkZXIoaSl7XHJcbiAgICAgICAgICAgICAgICBpZihpIDwgc2V0dGluZ3MucGxhY2Vob2xkZXIubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXR0aW5ncy5wbGFjZWhvbGRlci5jaGFyQXQoaSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0dGluZ3MucGxhY2Vob2xkZXIuY2hhckF0KDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZWVrTmV4dChwb3MpIHtcclxuXHRcdFx0XHR3aGlsZSAoKytwb3MgPCBsZW4gJiYgIXRlc3RzW3Bvc10pO1xyXG5cdFx0XHRcdHJldHVybiBwb3M7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNlZWtQcmV2KHBvcykge1xyXG5cdFx0XHRcdHdoaWxlICgtLXBvcyA+PSAwICYmICF0ZXN0c1twb3NdKTtcclxuXHRcdFx0XHRyZXR1cm4gcG9zO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzaGlmdEwoYmVnaW4sZW5kKSB7XHJcblx0XHRcdFx0dmFyIGksXHJcblx0XHRcdFx0XHRqO1xyXG5cclxuXHRcdFx0XHRpZiAoYmVnaW48MCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Zm9yIChpID0gYmVnaW4sIGogPSBzZWVrTmV4dChlbmQpOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmICh0ZXN0c1tpXSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoaiA8IGxlbiAmJiB0ZXN0c1tpXS50ZXN0KGJ1ZmZlcltqXSkpIHtcclxuXHRcdFx0XHRcdFx0XHRidWZmZXJbaV0gPSBidWZmZXJbal07XHJcblx0XHRcdFx0XHRcdFx0YnVmZmVyW2pdID0gZ2V0UGxhY2Vob2xkZXIoaik7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGogPSBzZWVrTmV4dChqKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0d3JpdGVCdWZmZXIoKTtcclxuXHRcdFx0XHRpbnB1dC5jYXJldChNYXRoLm1heChmaXJzdE5vbk1hc2tQb3MsIGJlZ2luKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNoaWZ0Uihwb3MpIHtcclxuXHRcdFx0XHR2YXIgaSxcclxuXHRcdFx0XHRcdGMsXHJcblx0XHRcdFx0XHRqLFxyXG5cdFx0XHRcdFx0dDtcclxuXHJcblx0XHRcdFx0Zm9yIChpID0gcG9zLCBjID0gZ2V0UGxhY2Vob2xkZXIocG9zKTsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGVzdHNbaV0pIHtcclxuXHRcdFx0XHRcdFx0aiA9IHNlZWtOZXh0KGkpO1xyXG5cdFx0XHRcdFx0XHR0ID0gYnVmZmVyW2ldO1xyXG5cdFx0XHRcdFx0XHRidWZmZXJbaV0gPSBjO1xyXG5cdFx0XHRcdFx0XHRpZiAoaiA8IGxlbiAmJiB0ZXN0c1tqXS50ZXN0KHQpKSB7XHJcblx0XHRcdFx0XHRcdFx0YyA9IHQ7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGFuZHJvaWRJbnB1dEV2ZW50KGUpIHtcclxuXHRcdFx0XHR2YXIgY3VyVmFsID0gaW5wdXQudmFsKCk7XHJcblx0XHRcdFx0dmFyIHBvcyA9IGlucHV0LmNhcmV0KCk7XHJcblx0XHRcdFx0aWYgKG9sZFZhbCAmJiBvbGRWYWwubGVuZ3RoICYmIG9sZFZhbC5sZW5ndGggPiBjdXJWYWwubGVuZ3RoICkge1xyXG5cdFx0XHRcdFx0Ly8gYSBkZWxldGlvbiBvciBiYWNrc3BhY2UgaGFwcGVuZWRcclxuXHRcdFx0XHRcdGNoZWNrVmFsKHRydWUpO1xyXG5cdFx0XHRcdFx0d2hpbGUgKHBvcy5iZWdpbiA+IDAgJiYgIXRlc3RzW3Bvcy5iZWdpbi0xXSlcclxuXHRcdFx0XHRcdFx0cG9zLmJlZ2luLS07XHJcblx0XHRcdFx0XHRpZiAocG9zLmJlZ2luID09PSAwKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHR3aGlsZSAocG9zLmJlZ2luIDwgZmlyc3ROb25NYXNrUG9zICYmICF0ZXN0c1twb3MuYmVnaW5dKVxyXG5cdFx0XHRcdFx0XHRcdHBvcy5iZWdpbisrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aW5wdXQuY2FyZXQocG9zLmJlZ2luLHBvcy5iZWdpbik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhciBwb3MyID0gY2hlY2tWYWwodHJ1ZSk7XHJcblx0XHRcdFx0XHR2YXIgbGFzdEVudGVyZWRWYWx1ZSA9IGN1clZhbC5jaGFyQXQocG9zLmJlZ2luKTtcclxuXHRcdFx0XHRcdGlmIChwb3MuYmVnaW4gPCBsZW4pe1xyXG5cdFx0XHRcdFx0XHRpZighdGVzdHNbcG9zLmJlZ2luXSl7XHJcblx0XHRcdFx0XHRcdFx0cG9zLmJlZ2luKys7XHJcblx0XHRcdFx0XHRcdFx0aWYodGVzdHNbcG9zLmJlZ2luXS50ZXN0KGxhc3RFbnRlcmVkVmFsdWUpKXtcclxuXHRcdFx0XHRcdFx0XHRcdHBvcy5iZWdpbisrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0aWYodGVzdHNbcG9zLmJlZ2luXS50ZXN0KGxhc3RFbnRlcmVkVmFsdWUpKXtcclxuXHRcdFx0XHRcdFx0XHRcdHBvcy5iZWdpbisrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aW5wdXQuY2FyZXQocG9zLmJlZ2luLHBvcy5iZWdpbik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRyeUZpcmVDb21wbGV0ZWQoKTtcclxuXHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGJsdXJFdmVudChlKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja1ZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbnB1dC52YWwoKSAhPSBmb2N1c1RleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQuY2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGtleWRvd25FdmVudChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQucHJvcChcInJlYWRvbmx5XCIpKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cdFx0XHRcdHZhciBrID0gZS53aGljaCB8fCBlLmtleUNvZGUsXHJcblx0XHRcdFx0XHRwb3MsXHJcblx0XHRcdFx0XHRiZWdpbixcclxuXHRcdFx0XHRcdGVuZDtcclxuICAgICAgICAgICAgICAgICAgICBvbGRWYWwgPSBpbnB1dC52YWwoKTtcclxuXHRcdFx0XHQvL2JhY2tzcGFjZSwgZGVsZXRlLCBhbmQgZXNjYXBlIGdldCBzcGVjaWFsIHRyZWF0bWVudFxyXG5cdFx0XHRcdGlmIChrID09PSA4IHx8IGsgPT09IDQ2IHx8IChpUGhvbmUgJiYgayA9PT0gMTI3KSkge1xyXG5cdFx0XHRcdFx0cG9zID0gaW5wdXQuY2FyZXQoKTtcclxuXHRcdFx0XHRcdGJlZ2luID0gcG9zLmJlZ2luO1xyXG5cdFx0XHRcdFx0ZW5kID0gcG9zLmVuZDtcclxuXHJcblx0XHRcdFx0XHRpZiAoZW5kIC0gYmVnaW4gPT09IDApIHtcclxuXHRcdFx0XHRcdFx0YmVnaW49ayE9PTQ2P3NlZWtQcmV2KGJlZ2luKTooZW5kPXNlZWtOZXh0KGJlZ2luLTEpKTtcclxuXHRcdFx0XHRcdFx0ZW5kPWs9PT00Nj9zZWVrTmV4dChlbmQpOmVuZDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNsZWFyQnVmZmVyKGJlZ2luLCBlbmQpO1xyXG5cdFx0XHRcdFx0c2hpZnRMKGJlZ2luLCBlbmQgLSAxKTtcclxuXHJcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKCBrID09PSAxMyApIHsgLy8gZW50ZXJcclxuXHRcdFx0XHRcdGJsdXJFdmVudC5jYWxsKHRoaXMsIGUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoayA9PT0gMjcpIHsgLy8gZXNjYXBlXHJcblx0XHRcdFx0XHRpbnB1dC52YWwoZm9jdXNUZXh0KTtcclxuXHRcdFx0XHRcdGlucHV0LmNhcmV0KDAsIGNoZWNrVmFsKCkpO1xyXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24ga2V5cHJlc3NFdmVudChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQucHJvcChcInJlYWRvbmx5XCIpKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cdFx0XHRcdHZhciBrID0gZS53aGljaCB8fCBlLmtleUNvZGUsXHJcblx0XHRcdFx0XHRwb3MgPSBpbnB1dC5jYXJldCgpLFxyXG5cdFx0XHRcdFx0cCxcclxuXHRcdFx0XHRcdGMsXHJcblx0XHRcdFx0XHRuZXh0O1xyXG5cclxuXHRcdFx0XHRpZiAoZS5jdHJsS2V5IHx8IGUuYWx0S2V5IHx8IGUubWV0YUtleSB8fCBrIDwgMzIpIHsvL0lnbm9yZVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGsgJiYgayAhPT0gMTMgKSB7XHJcblx0XHRcdFx0XHRpZiAocG9zLmVuZCAtIHBvcy5iZWdpbiAhPT0gMCl7XHJcblx0XHRcdFx0XHRcdGNsZWFyQnVmZmVyKHBvcy5iZWdpbiwgcG9zLmVuZCk7XHJcblx0XHRcdFx0XHRcdHNoaWZ0TChwb3MuYmVnaW4sIHBvcy5lbmQtMSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cCA9IHNlZWtOZXh0KHBvcy5iZWdpbiAtIDEpO1xyXG5cdFx0XHRcdFx0aWYgKHAgPCBsZW4pIHtcclxuXHRcdFx0XHRcdFx0YyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoayk7XHJcblx0XHRcdFx0XHRcdGlmICh0ZXN0c1twXS50ZXN0KGMpKSB7XHJcblx0XHRcdFx0XHRcdFx0c2hpZnRSKHApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRidWZmZXJbcF0gPSBjO1xyXG5cdFx0XHRcdFx0XHRcdHdyaXRlQnVmZmVyKCk7XHJcblx0XHRcdFx0XHRcdFx0bmV4dCA9IHNlZWtOZXh0KHApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZihhbmRyb2lkKXtcclxuXHRcdFx0XHRcdFx0XHRcdC8vUGF0aCBmb3IgQ1NQIFZpb2xhdGlvbiBvbiBGaXJlRm94IE9TIDEuMVxyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHByb3h5ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdCQucHJveHkoJC5mbi5jYXJldCxpbnB1dCxuZXh0KSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KHByb3h5LDApO1xyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0aW5wdXQuY2FyZXQobmV4dCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocG9zLmJlZ2luIDw9IGxhc3RSZXF1aXJlZE5vbk1hc2tQb3Mpe1xyXG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgIHRyeUZpcmVDb21wbGV0ZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGNsZWFyQnVmZmVyKHN0YXJ0LCBlbmQpIHtcclxuXHRcdFx0XHR2YXIgaTtcclxuXHRcdFx0XHRmb3IgKGkgPSBzdGFydDsgaSA8IGVuZCAmJiBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmICh0ZXN0c1tpXSkge1xyXG5cdFx0XHRcdFx0XHRidWZmZXJbaV0gPSBnZXRQbGFjZWhvbGRlcihpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHdyaXRlQnVmZmVyKCkgeyBpbnB1dC52YWwoYnVmZmVyLmpvaW4oJycpKTsgfVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gY2hlY2tWYWwoYWxsb3cpIHtcclxuXHRcdFx0XHQvL3RyeSB0byBwbGFjZSBjaGFyYWN0ZXJzIHdoZXJlIHRoZXkgYmVsb25nXHJcblx0XHRcdFx0dmFyIHRlc3QgPSBpbnB1dC52YWwoKSxcclxuXHRcdFx0XHRcdGxhc3RNYXRjaCA9IC0xLFxyXG5cdFx0XHRcdFx0aSxcclxuXHRcdFx0XHRcdGMsXHJcblx0XHRcdFx0XHRwb3M7XHJcblxyXG5cdFx0XHRcdGZvciAoaSA9IDAsIHBvcyA9IDA7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKHRlc3RzW2ldKSB7XHJcblx0XHRcdFx0XHRcdGJ1ZmZlcltpXSA9IGdldFBsYWNlaG9sZGVyKGkpO1xyXG5cdFx0XHRcdFx0XHR3aGlsZSAocG9zKysgPCB0ZXN0Lmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdGMgPSB0ZXN0LmNoYXJBdChwb3MgLSAxKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAodGVzdHNbaV0udGVzdChjKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0YnVmZmVyW2ldID0gYztcclxuXHRcdFx0XHRcdFx0XHRcdGxhc3RNYXRjaCA9IGk7XHJcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKHBvcyA+IHRlc3QubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0Y2xlYXJCdWZmZXIoaSArIDEsIGxlbik7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidWZmZXJbaV0gPT09IHRlc3QuY2hhckF0KHBvcykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcysrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBpIDwgcGFydGlhbFBvc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RNYXRjaCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGFsbG93KSB7XHJcblx0XHRcdFx0XHR3cml0ZUJ1ZmZlcigpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAobGFzdE1hdGNoICsgMSA8IHBhcnRpYWxQb3NpdGlvbikge1xyXG5cdFx0XHRcdFx0aWYgKHNldHRpbmdzLmF1dG9jbGVhciB8fCBidWZmZXIuam9pbignJykgPT09IGRlZmF1bHRCdWZmZXIpIHtcclxuXHRcdFx0XHRcdFx0Ly8gSW52YWxpZCB2YWx1ZS4gUmVtb3ZlIGl0IGFuZCByZXBsYWNlIGl0IHdpdGggdGhlXHJcblx0XHRcdFx0XHRcdC8vIG1hc2ssIHdoaWNoIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yLlxyXG5cdFx0XHRcdFx0XHRpZihpbnB1dC52YWwoKSkgaW5wdXQudmFsKFwiXCIpO1xyXG5cdFx0XHRcdFx0XHRjbGVhckJ1ZmZlcigwLCBsZW4pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly8gSW52YWxpZCB2YWx1ZSwgYnV0IHdlIG9wdCB0byBzaG93IHRoZSB2YWx1ZSB0byB0aGVcclxuXHRcdFx0XHRcdFx0Ly8gdXNlciBhbmQgYWxsb3cgdGhlbSB0byBjb3JyZWN0IHRoZWlyIG1pc3Rha2UuXHJcblx0XHRcdFx0XHRcdHdyaXRlQnVmZmVyKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHdyaXRlQnVmZmVyKCk7XHJcblx0XHRcdFx0XHRpbnB1dC52YWwoaW5wdXQudmFsKCkuc3Vic3RyaW5nKDAsIGxhc3RNYXRjaCArIDEpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIChwYXJ0aWFsUG9zaXRpb24gPyBpIDogZmlyc3ROb25NYXNrUG9zKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aW5wdXQuZGF0YSgkLm1hc2suZGF0YU5hbWUsZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gJC5tYXAoYnVmZmVyLCBmdW5jdGlvbihjLCBpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGVzdHNbaV0mJmMhPWdldFBsYWNlaG9sZGVyKGkpID8gYyA6IG51bGw7XHJcblx0XHRcdFx0fSkuam9pbignJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHJcblx0XHRcdGlucHV0XHJcblx0XHRcdFx0Lm9uZShcInVubWFza1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGlucHV0XHJcblx0XHRcdFx0XHRcdC5vZmYoXCIubWFza1wiKVxyXG5cdFx0XHRcdFx0XHQucmVtb3ZlRGF0YSgkLm1hc2suZGF0YU5hbWUpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0Lm9uKFwiZm9jdXMubWFza1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQucHJvcChcInJlYWRvbmx5XCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQoY2FyZXRUaW1lb3V0SWQpO1xyXG5cdFx0XHRcdFx0dmFyIHBvcztcclxuXHJcblx0XHRcdFx0XHRmb2N1c1RleHQgPSBpbnB1dC52YWwoKTtcclxuXHJcblx0XHRcdFx0XHRwb3MgPSBjaGVja1ZhbCgpO1xyXG5cclxuXHRcdFx0XHRcdGNhcmV0VGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpbnB1dC5nZXQoMCkgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblx0XHRcdFx0XHRcdHdyaXRlQnVmZmVyKCk7XHJcblx0XHRcdFx0XHRcdGlmIChwb3MgPT0gbWFzay5yZXBsYWNlKFwiP1wiLFwiXCIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdGlucHV0LmNhcmV0KDAsIHBvcyk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0aW5wdXQuY2FyZXQocG9zKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSwgMTApO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0Lm9uKFwiYmx1ci5tYXNrXCIsIGJsdXJFdmVudClcclxuXHRcdFx0XHQub24oXCJrZXlkb3duLm1hc2tcIiwga2V5ZG93bkV2ZW50KVxyXG5cdFx0XHRcdC5vbihcImtleXByZXNzLm1hc2tcIiwga2V5cHJlc3NFdmVudClcclxuXHRcdFx0XHQub24oXCJpbnB1dC5tYXNrIHBhc3RlLm1hc2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LnByb3AoXCJyZWFkb25seVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHBvcz1jaGVja1ZhbCh0cnVlKTtcclxuXHRcdFx0XHRcdFx0aW5wdXQuY2FyZXQocG9zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5RmlyZUNvbXBsZXRlZCgpO1xyXG5cdFx0XHRcdFx0fSwgMCk7XHJcblx0XHRcdFx0fSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hyb21lICYmIGFuZHJvaWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9mZignaW5wdXQubWFzaycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbignaW5wdXQubWFzaycsIGFuZHJvaWRJbnB1dEV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0XHRjaGVja1ZhbCgpOyAvL1BlcmZvcm0gaW5pdGlhbCBjaGVjayBmb3IgZXhpc3RpbmcgdmFsdWVzXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG59KSk7Il0sImZpbGUiOiJtYXNrLmpzIn0=
