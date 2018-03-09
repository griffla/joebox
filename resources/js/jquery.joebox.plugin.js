/*
joebox v0.1
by Joscha Schmidt - http://www.joschaschmidt.de

For more information, visit:
http://joebox.joschaschmidt.de/

Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
- free for use in both personal and commercial projects
- attribution requires leaving author name, author link, and the license info intact
*/

(function($){
  "use strict";
  var joebox_timer;
  var joebox_dragging = false;

  var settings = {};
  var defaults = {
      slide_duration: 400,
      preload_siblings: true,
      modal_backdrop_background_color: '#000',
      modal_backdrop_opacity: 0.5,
      modal_backdrop_zindex: 10,
      modal_backdrop_show_duration: 300,
      slide_easing: 'swing'
  };

  
	var methods = {
		// Define the initial operations
		init : function(options) {
      /* Merge defaults and developer defined settings */
      this.each(function(n) {
        var settings = $.extend(true, {}, defaults, options);

        $(this).data("settings", settings);
      });

      $('body')
      .on('touchmove', function() {
        joebox_dragging = true;
      })
      .on('touchstart', function() {
        joebox_dragging = false;
      });
      
      this
      .addClass('joebox-gallery')
      .on('mousedown touchend', 'a img:only-child()', function (e) {
        var $this = $(this);
        jQuery.data(document.body, "joebox-gallery", $(this).closest('.joebox-gallery'));
        if (joebox_dragging)
        return;
        e.preventDefault();
        
        var $joebox_item = $this.closest('.joebox-item');
        var joebox_item_index = $joebox_item.index();
        var joebox_id = jQuery.data(document.body, "joebox-gallery").attr('id');
        var $target_joebox = $('#joebox-' + joebox_id);
        
        if (!$target_joebox.length) {
          methods.build_joebox($this.parent());
        } else {
          // Do this if the joebox just exists
          var $target_image = jQuery('#joebox-image-'+ jQuery.data(document.body, "joebox-gallery").attr('id') + '-'+ joebox_item_index);
          methods.joebox_show_modal();

          methods.joebox_preload_image($target_image, false, 1, 1, 1, function () {
            $target_image
            .css({
              width: '',
            })
            .parent()
              .addClass('active');
            
            methods.joebox_toggle_nav_buttons(0, function () {
              $target_joebox.show();
            });
            methods.joebox_show_target_image($target_joebox, joebox_item_index);
          });
        }
      });
    },
    
    build_joebox: function($trigger) {
      methods.joebox_show_modal();
      
      if (!$('#joebox').length) {
        $('body').append('<div id="joebox"><div id="joebox-loader" class="joebox-loader"></div></div>');
      }
      
      var $joebox = jQuery('<div id="joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id') + '" class="joebox">' +
                      '<div class="joebox-inner">' +
                          '<a class="joebox-icon joebox-close-icon"><i></i></a>' +

                          '<a class="joebox-icon joebox-nav-icon joebox-nav-prev"><i class="joebox-icon-arrow joebox-icon-left"></i></a>' +
                          '<a class="joebox-icon joebox-nav-icon joebox-nav-next"><i class="joebox-icon-arrow joebox-icon-right"></i></a>' +

                          '<div class="joebox-image-wrapper"><div></div></div>' +
                      '</div>' +
                  '</div>');

      jQuery('#joebox').append($joebox);

      methods.joebox_build_items($joebox, $trigger);
      
      $('body')
      .on('mousedown touchend', '#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id'), function (e) {
        if (!joebox_dragging) {
          var $target = $(e.target),
              $active_img = $(this).find('.joebox-item.active').find('img'),
              act_pos_x = parseInt($active_img.offset().left),
              act_pos_y = parseInt($active_img.offset().top),
              act_height = parseInt($active_img.height()),
              act_width = parseInt($active_img.width());

          if (
            !$target.hasClass('joebox-nav-icon') &&
            !$target.hasClass('joebox-icon-arrow') &&
            (
              e.pageX < act_pos_x ||
              e.pageY < act_pos_y ||
              e.pageX > act_pos_x + act_width ||
              e.pageY > act_pos_y + act_height
            )
          ) {
            methods.joebox_hide($(this));
          }
          else if ($target.is('.joebox-close-icon') || $('.joebox-close-icon').has(e.target).length > 0) {
            methods.joebox_hide($(this));
          }
        }
      });
    },
    
    joebox_build_items: function($joebox, $trigger) {
      var $joebox_image_wrapper = $joebox.find('.joebox-image-wrapper'),
          $joebox_image_container = $joebox_image_wrapper.find('div:first-child'),
          $joebox_image_wrapper_inner_width = $joebox_image_wrapper.width(),
          gallery = $trigger.closest('.joebox-gallery'),
          joebox_gallery_id = jQuery.data(document.body, "joebox-gallery").attr('id'),
          i = 0;

      gallery // Go through the gallery items to append all the images to the current lightbox
      .find('.joebox-item')
          .each(function () {
              var $this = jQuery(this),
                  link = $this.find('a').attr('href'),
                  is_trigger_img = link == $trigger.attr('href');
        
              $joebox_image_container
                .append('<div id="joebox-item-'+ joebox_gallery_id + '-'+ i +'" class="joebox-item '+
                          (is_trigger_img ? 'active' : '') + // If this is the image of the trigger
                          '" style="left: '+ $joebox_image_wrapper_inner_width * i +'px"></div>'
                       );

              var $joebox_item = $joebox_image_wrapper.find('#joebox-item-'+ joebox_gallery_id + '-'+ i);

              $joebox_item
              .append('<img class="joebox-image" id="joebox-image-' + joebox_gallery_id + '-'+ i +'" data-joebox-src="'+ link +'" style="">'); // create the image with data-attribute for the source. Prepend long loading.

              var $active_img = jQuery('#joebox-image-'+ joebox_gallery_id + '-'+ i);

              if (!is_trigger_img) {
                methods.joebox_preload_image($active_img, true, 0, 0, 0);

                $active_img
                .css({
//                  width: $joebox_item.width() / 1.2,
                });
              }

              if (is_trigger_img) { // choose the right one
                methods.joebox_preload_image($active_img, false, 1, 1, 1);
                methods.joebox_show_target_image($joebox, i);
              }

              i++;
          });

      var $active = $joebox_image_wrapper.find('.joebox-item.active');
      methods.joebox_toggle_nav_buttons();

      
      $(document)
      .off('keyup') // Unregister keyup event from documewnt first to prevent multiple run
      .on('keyup', function(e) {
        if (e.which == 27 || e.which == 32) {
          methods.joebox_hide($('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id')));
        } else if (e.which == 37) {
          methods.joebox_find_slide_in_target_body('prev');
        } else if (e.which == 39) {
          methods.joebox_find_slide_in_target_body('next');
        }
      });
      
      $joebox
      .on('click touchend', '.joebox-nav-icon', function (e) {
        if (e.type === 'touchend') {
          // Unbind click event handler if it's a device understading touch events
          $joebox.off('click');
        }

        var $this = jQuery(this);

        if ($this.hasClass('joebox-nav-prev')) {
          methods.joebox_find_slide_in_target_body('prev');
        }
        else if ($this.hasClass('joebox-nav-next')) {
          methods.joebox_find_slide_in_target_body('next');
        }
      })
      .swipe({
        swipeStatus: function(e, phase, direction, distance, duration, fingerCount, fingerData) {
          var $joebox = jQuery('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id'));
          var $joebox_inner = $joebox.find('.joebox-image-wrapper');
          
          if (phase === 'start') {
            // Save the initial inner position
            jQuery.data(document.body, "joebox_inner_position", $joebox_inner.css('left'));
            // Get the currently active item
            jQuery.data(document.body, "joebox_item_active", jQuery('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id')).find('.joebox-item.active'));
          }

          if (direction === 'right') {
            $joebox_inner.css('left', parseFloat(jQuery.data(document.body, "joebox_inner_position")) + distance + 'px');
          }
          
          if (direction === 'left') {
            $joebox_inner.css('left', parseFloat(jQuery.data(document.body, "joebox_inner_position")) - distance + 'px');
          }

          if (phase === 'end') {
            var joebox_swipe_speed = distance / duration;

            if (distance > (jQuery.data(document.body, "joebox_item_active").width() / 2) || joebox_swipe_speed >= 0.3) {
              if (direction === 'right') {
                // Check if this is the first image in a collection. Jump back to initial position if a right swipe has been triggered.
                if (!jQuery.data(document.body, "joebox_item_active").prev().length) {
                  $joebox_inner
                  .finish()
                  .animate({
                    left: parseFloat(jQuery.data(document.body, "joebox_inner_position")) + 'px'
                  }, settings.slide_duration, settings.slide_easing);
                } else {
                  methods.joebox_find_slide_in_target_body('prev');
                }
              }
              if (direction === 'left') {
                // Check if this is the last image in a collection. Jump back to initial position if a right swipe has been triggered.
                if (!jQuery.data(document.body, "joebox_item_active").next().length) {
                  $joebox_inner
                  .finish()
                  .animate({
                    left: parseFloat(jQuery.data(document.body, "joebox_inner_position")) + 'px'
                  }, settings.slide_duration, settings.slide_easing);
                } else {
                  methods.joebox_find_slide_in_target_body('next');
                }
              }
            } else {
              $joebox_inner.animate({
                left: parseFloat(jQuery.data(document.body, "joebox_inner_position")) + 'px'
              }, settings.slide_duration, settings.slide_easing);
            }
          }
        },
        threshold: 10
      });
    },
    
    joebox_show_target_image: function ($joebox, image_index) {
      var $joebox_image_wrapper = $joebox.find('.joebox-image-wrapper'),
          $joebox_image_wrapper_inner_width = $joebox_image_wrapper.width();

      $joebox_image_wrapper.css({
        left: -($joebox_image_wrapper_inner_width * image_index) + 'px'
      });
    },
    
    joebox_find_slide_in_target_body: function(direction) {
      // Defaults to next 
      var $joebox_item_active = jQuery('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id')).find('.joebox-item.active');
      var $joebox_body_target = $joebox_item_active.next();

      if (direction === 'prev') {
        $joebox_body_target = $joebox_item_active.prev();
      }

      methods.joebox_slide_material($joebox_body_target);
    },


    joebox_slide_material: function($joebox_body_target) {
      var $joebox = jQuery('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id'));
      var $joebox_image_wrapper = $joebox.find('.joebox-image-wrapper');
      var $joebox_item_active = $joebox_image_wrapper.find('.joebox-item.active');

      if ($joebox_body_target.length) {
        $joebox_item_active.removeClass('active');

        var $new_active = $joebox_body_target.addClass('active');
        var $slide_in_img = $new_active.find('img');
        var $slide_out_img = $joebox_item_active.find('img');

        jQuery.data(document.body, "joebox_slide_in_img", $slide_in_img);
        jQuery.data(document.body, "joebox_slide_out_img", $slide_out_img);

        if (typeof $slide_in_img.attr('src') == 'undefined') { // check if this image already exists
          methods.joebox_preload_image($slide_in_img, false, 0, 0, 1, methods.joebox_slide_animation); // load the image if not
        }
        else {
          methods.joebox_slide_animation();
        }

        methods.joebox_toggle_nav_buttons();
      }
    },

    joebox_slide_animation: function() {
      var settings = jQuery.data(document.body, "joebox-gallery").data("settings");
      var $joebox = jQuery('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id'));
      var $joebox_inner = $joebox.find('.joebox-image-wrapper');
      var $joebox_item_active = $joebox_inner.find('.joebox-item.active');
      var joebox_inner_target_offset = parseInt($joebox_item_active.css('left'));
      /* Slide in image */
      var $slide_in_img = jQuery.data(document.body, "joebox_slide_in_img");
      /* Slide out image */
      var $slide_out_img = jQuery.data(document.body, "joebox_slide_out_img");
      
      $joebox_inner
      .finish()
      .animate({
        left: -joebox_inner_target_offset,
      }, settings.slide_duration, settings.slide_easing);

//      $slide_in_img   
//      .finish()
//      .animate({
//        width: $joebox_item_active.width(),
//      }, settings.slide_duration, settings.slide_easing, function () {
//        $slide_in_img.css('width', '');
//      });
//
//      $slide_out_img
//      .finish()
//      .animate({
//        width: $joebox_item_active.width() / 1.2,
//      }, settings.slide_duration, settings.slide_easing);
      
      
        /* Preload siblings if defined */
        if (settings.preload_siblings) {
          /* Check if there are siblings and load them */
          var $slide_in_img_prev = $joebox_item_active.prev().find('img');
          var $slide_in_img_next = $joebox_item_active.next().find('img');

          if ($slide_in_img_prev.length && typeof $slide_in_img_prev.attr('src') == 'undefined') {
            methods.joebox_preload_image($slide_in_img_prev, true, 0, 0, 1);
          }

          if ($slide_in_img_next.length && typeof $slide_in_img_next.attr('src') == 'undefined') {
            methods.joebox_preload_image($slide_in_img_next, true, 0, 0, 1);
          }
        }

    },

    joebox_preload_image: function($img, hide_loader, load_sibling_next, load_sibling_prev, add_src, callback) {
      var img_src = $img.attr('src');
      
      if (typeof img_src === 'undefined') {
        if (!hide_loader) {
          joebox_timer = setTimeout(function() { 
            methods.joebox_loader_initialise(); 
          }, 200);
        }

        if (add_src) {
          $img.attr('src', $img.attr('data-joebox-src')); // Attach the src attribute with the link from data attribute
        }

        $img
        .on('load', function() {
          if (!hide_loader) {
            clearTimeout(joebox_timer);
            methods.joebox_loader_hide();
          }

          $img.show();

          if (jQuery.data(document.body, "joebox-gallery").data("settings").preload_siblings) {
            if (load_sibling_next) {
              var sibling_next = $img.parent().next().find('img');
              methods.joebox_preload_image(sibling_next, true, 0, 0, 1);
            }

            if (load_sibling_prev) {
              var sibling_prev = $img.parent().prev().find('img');
              methods.joebox_preload_image(sibling_prev, true, 0, 0, 1);
            }
          }
        });
      }
      
      // Run a callback if defined
      if (typeof callback === "function") {
        callback();
      }
    },

    joebox_toggle_nav_buttons: function(duration, callback) {
      duration = typeof duration !== 'undefined' ? duration : 200;
      var $joebox = jQuery('#joebox-' + jQuery.data(document.body, "joebox-gallery").attr('id'));
      var $active = $joebox.find('.joebox-image-wrapper').find('.joebox-item.active');

      if ($active.next().length) {
        $joebox
        .find('a.joebox-nav-next')
          .removeClass('disabled');
      } else {
        $joebox
        .find('a.joebox-nav-next')
          .addClass('disabled');
      }

      if ($active.prev().length) {
        $joebox
        .find('a.joebox-nav-prev')
          .removeClass('disabled');
      } else {
        $joebox
        .find('a.joebox-nav-prev')
          .addClass('disabled');
      }
      
      // Run a callback if defined
      if (typeof callback === "function") {
        callback();
      }
    },

    joebox_hide: function($joebox, callback) {
      $joebox
      .fadeOut(300, function () {
        if (typeof callback === "function") {
          callback();
        }
      })
      .find('.joebox-item.active')
        .removeClass('active');

      methods.joebox_loader_hide();
      methods.hide_modal_backdrop();
    },

    joebox_destroy: function($joebox) {
      methods.joebox_hide($joebox, function () {
        methods.joebox_loader_hide();
        $joebox.remove();
      });
    },

    joebox_loader_initialise: function() {
      $('#joebox-loader').show();
    },

    joebox_loader_hide: function() {
      $('#joebox-loader').hide();
    },
    
    joebox_show_modal: function () {
      var settings = jQuery.data(document.body, "joebox-gallery").data("settings");
      
      methods.show_modal_backdrop(
        settings.modal_backdrop_show_duration,
        settings.modal_backdrop_opacity,
        settings.modal_backdrop_background_color,
        settings.modal_backdrop_zindex
      );
    },
    
    show_modal_backdrop: function (duration, opac, bgColor, zIndex) {
      methods.hide_modal_backdrop();
      var anim_args = {};

      /* build the animation arguments */
      anim_args.opacity = (opac ? opac : 0.5);

      jQuery('<div id="joebox-modal-backdrop" class="modal-backdrop" style="opacity: 0; ' + (bgColor ? 'background-color: '+ bgColor : '') + '; ' + (zIndex ? 'z-index: '+ zIndex : '') + '"></div>')
      .appendTo('body')
      .animate(anim_args, {duration: (duration ? duration : 250), queue: false});
    },

    hide_modal_backdrop: function (duration) {
        if (jQuery('#joebox-modal-backdrop').length) {
            jQuery('#joebox-modal-backdrop')
            .fadeOut((duration ? duration : 200), function () {
                jQuery(this).remove();
            });
        }
    }

  };
	
	$.fn.joebox = function(method) {
		if (methods[method]) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.joebox');
		}
	};
})(jQuery);