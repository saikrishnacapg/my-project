angular.module('myaccount.route').controller('MaTourCtrl', function ($scope, mobileValue) {
	var cookieHideTour = 'synergy.hideTourChanges';
	var images = [
		{
			name: 'Account-Summary.jpg',
			alt:
				'Account summary page is an overview of your account. It includes payment options, concessions, energy tips and a snapshot of your energy usage.'
		},
		{
			name: 'Default-Graph-View.jpg',
			alt: 'View your daily interval data in graph format.'
		},
		{
			name: 'Default-Table-View.jpg',
			alt: 'View your daily interval data in table format.'
		},
		{
			name: 'Daily-Graph-View.jpg',
			alt: 'View your daily interval data in graph format.'
		},
		{
			name: 'Daily-table-view.jpg',
			alt: 'View your daily interval data in table format.'
		}
	];

	// Pass the tool-tip content, type, direction, top and left for the pointer placement.
	var toolTipsCollection = [
		[
			{
				content:
					'Here you’ll find information about your account including payment options and concessions, plus a snapshot of your energy usage and energy saving tips.',
				top: 21,
				left: 42,
				direction: 'down',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 12000
			},
			{
				content:
					'These graphs give you a snapshot of your energy usage since your last bill was issued, including the lowest, highest and average usage days.',
				top: 45,
				left: 18,
				direction: 'up',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 9000
			},
			{
				content: 'Learn more about energy saving tips.',
				top: 81,
				left: 50,
				direction: 'up',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 6000
			}
		],
		[
			{
				content:
					'On the usage dashboard you’ll find information about your daily energy consumption, usage trends and half hourly energy usage.',
				top: 11.5,
				left: 54,
				direction: 'down',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 9000
			},
			{
				content: 'View your daily interval data in graph format.',
				top: 23,
				left: 5,
				direction: 'up',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 6000
			},
			{
				content: 'Click each graph bar for more information about your daily energy consumption.',
				top: 36,
				left: 57,
				direction: 'right',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 9000
			},
			{
				content:
					'Get insights into your energy consumption during the billed period with our new trend breakdown.',
				top: 62,
				left: 20,
				direction: 'up',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 9000
			},
			{
				content: 'Get insights into your energy consumption for the period yet to be billed.',
				top: 62,
				left: 75,
				direction: 'up',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 6000
			}
		],
		[
			{
				content: 'View your daily interval data in table format.',
				top: 23,
				left: 10,
				direction: 'up',
				color: ' #2F2A95',
				textColor: '#ffffff',
				timer: 6000
			},
			{
				content: 'View each day’s interval data and total cost per day.',
				top: 30,
				left: 35,
				direction: 'right',
				color: ' #2F2A95',
				textColor: '#ffffff',
				timer: 6000
			}
		],
		[
			{
				content: 'Use the graph format to view your daily usage cost and time of day usage.',
				top: 40,
				left: 38,
				direction: 'right',
				color: ' #2F2A95',
				textColor: '#ffffff',
				timer: 12000
			}
		],
		[
			{
				content: 'View your time of day usage and your daily usage cost.',
				top: 20,
				left: 27,
				direction: 'right',
				color: '#2F2A95',
				textColor: '#ffffff',
				timer: 12000
			}
		]
	];

	var welcomeText =
		"<div class='welcomeTextContainer'><h3>Welcome to the <strong>My Account</strong> tour </h3> <p>Here you can explore all the features of your AMI smart meter <br/>and track your energy usage that may help to reduce your bill.</p></div> ";
	/* Modal */
	var modal = document.querySelector('.ma_tour--modal');
	var closeButton = document.querySelector('.ma_tour--modal-close');
	var modalHelpButton = document.querySelector('.ma_tour--launch-button'); // Button that triggers the modal
	/* Carousel */
	var defaultLaunchButton = document.querySelector('.ma_tour--launch-button-default');
	var slideInnerContainer = document.querySelector('.ma_tour--slider-inner');
	var previousButton = document.querySelector('.ma_tour--slider-prev');
	var nextButton = document.querySelector('.ma_tour--slider-next');
	// Carousel dots
	var slideIndicators = document.querySelector('.ma_tour--slider-dots-container');
	var instructionContainer = document.querySelector('.instruction-container');

	/* Slide controllers */
	var autoPlay = false; // Used to pause and play the slide
	var slideIndex = 0; // Used to control the active slide
	var currentSlideIndex = slideIndex;
	var slideTransitionDelays = [7000, 7000, 7000, 5000, 5000, 5000]; // The time in milliseconds before the next slide is transitioned.
	var slideTimer = null; // Controls the slide transition
	var toolTipTimer = null; // Controls the tooltips
	var endOfSlide = false; // Controls the end of slide
	var toolTipDelay = 3000;

	// Used to detect breakpoints
	var isTablet = window.matchMedia('screen and (min-width: 768px)');
	var isDesktop = window.matchMedia('screen and (min-width: 1024px)');

	// Setup images, slides and tooltip base on the media breakpoint
	if (!mobileValue) {
		setupTour(images);
	} else {
		toggleModal(false);
		defaultLaunchButton.classList.add('hide');
	}

	function appendToSlideIndicator(slideIndex) {
		var indicator = createSlideIndicator(slideIndex);
		slideIndicators.append(indicator);
	}

	function createWelcomeSlide() {
		var slideContainer = document.createElement('div');
		slideContainer.setAttribute('class', 'slide fade');

		// Create the image slide
		var bodyContent = document.createElement('div');
		bodyContent.classList.add('ma_tour--slide-welcome');
		bodyContent.innerHTML =
			`<p>${welcomeText}</p>` +
			`<button class="button button-start-tour" data-event="site-interaction" data-location="tour" data-description="start tour" data-type="button">Start tour</button>`;

		slideContainer.append(bodyContent);

		appendToSlideIndicator(slideIndex);
		slideInnerContainer.append(slideContainer); // Append the image slide to the slide container
	}

	function createThankYouSlide() {
		var slideContainer = document.createElement('div');
		slideContainer.setAttribute('class', 'slide fade');

		// Create the image slide
		var bodyContent = document.createElement('div');
		bodyContent.classList.add('ma_tour--slide-thankyou');
		bodyContent.innerHTML =
			"<h3 class='thankyou-message-1'>Thank you for </h3>" +
			"<h3 class='thankyou-message-2'>completing the tour</h3> <br/>" +
			'<p>To find out more about AMI smart meters <a title="visit Advance meters" class="synergy-link" target="_blank" href="https://www.synergy.net.au/Your%20home/Manage%20account/Track%20your%20usage/Advanced%20metering">visit Advance meters</a></p>' +
			'<button class="button button-close-tour">Close tour</button>';

		slideContainer.append(bodyContent);

		appendToSlideIndicator(images.length + 1);
		slideInnerContainer.append(slideContainer); // Append the image slide to the slide container
	}

	function setupTour(images) {
		createWelcomeSlide();
		images.forEach(function (image, index) {
			generateSlide(image, index);
		});
		createThankYouSlide();
	}

	// When the page has loaded
	this.initTour = function () {
		if (!mobileValue) {
			setupEventListeners();
			showModal();
			setActiveSlide();
		}
	};

	// This function generate slides and dots based on images array length.
	function generateSlide(image, slideIndex) {
		// Create the slide container
		var slideContainer = document.createElement('div');
		slideContainer.setAttribute('class', 'slide fade');
		// Create the image slide
		var imageSlide = createImageSlide(image);
		slideContainer.append(imageSlide);

		appendToSlideIndicator(slideIndex + 1);

		slideInnerContainer.append(slideContainer); // Append the image slide to the slide container
	}

	function setElementProperties(element, attribute, value) {
		element.setAttribute(attribute, value);
	}
	function createImageSlide(image, silderImageWidth) {
		// Create picture element
		var pictureElement = document.createElement('picture');

		// Set desktop version
		var desktopSource = document.createElement('source');
		setElementProperties(desktopSource, 'srcset', `img/ma-tour/${image.name}`);
		setElementProperties(desktopSource, 'media', '(min-width: 1024px)');

		var imageSlide = document.createElement('img');
		imageSlide.setAttribute('src', `img/ma-tour/${image.name}`);
		imageSlide.setAttribute('alt', image.alt);
		imageSlide.style.width = silderImageWidth;

		pictureElement.append(desktopSource, imageSlide);

		return pictureElement;
	}

	function createSlideIndicator(slideIndex) {
		var dot = document.createElement('span');
		dot.setAttribute('class', 'dot');
		dot.setAttribute('index', slideIndex);
		dot.setAttribute('tabindex', '0');
		dot.addEventListener('click', updateCurrentSlide);
		dot.addEventListener('keydown', handleDotkeyDown);

		return dot;
	}

	function handleDotkeyDown(event) {
		var key = event.key.toLowerCase();
		switch (key) {
			case 'enter':
				updateCurrentSlide(event);
				break;
			default:
				break;
		}
	}

	/* Slides */
	var welcomeScreenTimer = null;
	var slides = document.querySelectorAll('.slide');
	var playButton = document.querySelector('.ma_tour--slider-play-button');
	var welcomeBodyContent = document.querySelector('.ma_tour--slide-welcome');

	function startTour() {
		var welcomeSlideTransitionTime = 5000;
		welcomeBodyContent.classList.add('hidden');
		instructionContainer.classList.remove('hidden');
		autoPlay = true;
		togglePlayButton(autoPlay);

		welcomeScreenTimer = setTimeout(function () {
			if (autoPlay) {
				nextSlide();
			}
		}, welcomeSlideTransitionTime);
	}

	function setupEventListeners() {
		var startTourButton = document.querySelector('.button-start-tour');
		var closeTourButton = document.querySelector('.button-close-tour');
		if (startTourButton) {
			startTourButton.addEventListener('click', startTour);
		}
		if (previousButton) {
			previousButton.addEventListener('click', previousSlide);
		}
		if (nextButton) {
			nextButton.addEventListener('click', nextSlide);
		}
		if (modalHelpButton) {
			modalHelpButton.addEventListener('click', showHelpModal);
		}
		if (closeButton) {
			closeButton.addEventListener('click', hideModal);
		}
		if (closeTourButton) {
			closeTourButton.addEventListener('click', hideModal);
		}
		if (playButton) {
			playButton.addEventListener('click', handleAutoPlay);
		}
		// When the user clicks anywhere outside of the modal, close it
		window.addEventListener('click', handleOutsideModalClick);

		// Hides the modal if escape is hit.
		window.addEventListener('keydown', handleEscapeKey);
	}

	function handleOutsideModalClick(event) {
		if (event.target === modal) {
			hideModal();
		}
	}

	function handleEscapeKey(event) {
		var key = event.key;
		if (key === 'Escape' || key === 'Esc') {
			hideModal();
		}
	}

	function showHelpModal() {
		showModal(true);
	}

	function showModal(isHelp) {
		document.body.classList.add('overflowY');
		defaultLaunchButton.classList.add('hide');
		if (localStorage.getItem(cookieHideTour) && !isHelp) {
			hideModal();
		} else {
			toggleModal(true);
		}
		setActiveSlide();
	}

	function hideModal() {
		localStorage.setItem(cookieHideTour, 'true');
		document.body.classList.remove('overflowY');
		defaultLaunchButton.classList.remove('hide');
		resetGuidedTour();
		toggleModal(false);
	}

	function resetGuidedTour() {
		if (welcomeBodyContent) {
			welcomeBodyContent.classList.remove('hidden');
		}
		slideIndex = 0;
		autoPlay = false;
		togglePlayButton();
		resetToolTipAnimation();
	}

	function toggleModal(show) {
		if (modal) {
			modal.style.display = show ? 'flex' : 'none';
		}
	}

	function setActiveSlide() {
		if (slides) {
			// Hide all slides
			slides.forEach(removeActiveClass);
			// Set active to the current index and show it
			slides[slideIndex].classList.toggle('active');
			showActiveSlide();
		}
	}

	function removeActiveClass(element) {
		element.classList.remove('active');
	}

	// Set slider previous and next navigation
	function nextSlide() {
		instructionOverlay();
		resetToolTipAnimation();
		// Check to see if it's not reached the end.
		if (slideIndex < slides.length - 1) {
			slideIndex += 1;
			setActiveSlide(slideIndex);
		}
	}

	function previousSlide() {
		resetToolTipAnimation();
		// Check to see if it's not the beginning
		if (slideIndex === 0) {
			resetGuidedTour();
		} else {
			slideIndex -= 1;
		}
		setActiveSlide(currentSlideIndex);
	}

	function resetToolTipAnimation() {
		clearToolTips();
		clearTimeout(toolTipTimer);
		clearTimeout(slideTimer);
		clearTimeout(welcomeScreenTimer);
	}

	// Current slide
	function updateCurrentSlide(event) {
		resetToolTipAnimation();
		var itemIndex = event.target.getAttribute('index'); // Find the clicked item's index
		slideIndex = parseInt(itemIndex, 10); // Update the current slide index
		setActiveSlide(slideIndex); // Change the activeSlide to that index
	}

	function handleAutoPlay() {
		autoPlay ? pauseSlideshow() : playSlideshow();
	}

	// Pause Slide show function
	function pauseSlideshow() {
		autoPlay = false;
		togglePlayButton(autoPlay);
		clearTimeout(slideTimer);
	}

	// Play Slide show function
	function playSlideshow() {
		autoPlay = true;
		togglePlayButton(autoPlay);
		if (endOfSlide) {
			progressNextSlide();
		}
	}

	function togglePlayButton(isPlaying) {
		isPlaying ? playButton.classList.add('pause') : playButton.classList.remove('pause');
	}

	function showHideNavigationButtons() {
		var isLastSlide = slideIndex === slides.length - 1;
		var isFirstSlide = slideIndex === 0;
		isFirstSlide ? previousButton.classList.add('hidden') : previousButton.classList.remove('hidden');
		isLastSlide ? nextButton.classList.add('hidden') : nextButton.classList.remove('hidden');
	}

	function instructionOverlay() {
		instructionContainer.classList.add('hidden');
	}

	function clearToolTips() {
		// Remove existing pointer button before generate new one
		var pulseIndicators = document.querySelectorAll('.pulser');
		if (pulseIndicators) {
			pulseIndicators.forEach(function (pulser) {
				pulser.remove();
			});
		}
	}

	function showActiveSlide() {
		if (currentSlideIndex === 0) {
			welcomeBodyContent.classList.remove('hidden');
		}
		instructionOverlay(); // Instruction for controls
		resetToolTipAnimation();
		showHideNavigationButtons(); // Controls arrows
		updateActiveSlideIndicator(); // Controls dots
		showToolTipsForActiveSlide(progressNextSlide); // Controls tips
	}

	function updateActiveSlideIndicator() {
		var dots = document.querySelectorAll('.dot');
		if (dots) {
			dots.forEach(removeActiveClass);
			// Set the active dot to the active slide index
			dots[slideIndex].classList.toggle('active');
		}
	}

	function showToolTipsForActiveSlide(gotToNextSlide) {
		var isWelcomePage = slideIndex === 0;
		var isThankYouPage = slideIndex === slides.length - 1;
		var toolTipIndex = 0; // Use this index to control the tool tip generation
		var toolTips = toolTipsCollection[slideIndex - 1]; // Minus one here because of the welcome page.

		if (isWelcomePage || isThankYouPage) {
			return true;
		}
		// Add a little sutlety for a nicer user experience.
		toolTipTimer = setTimeout(function () {
			showToolTip();
		}, toolTipDelay);

		function showToolTip() {
			var tip = generateTooltip(toolTips[toolTipIndex]);
			slides[slideIndex].append(tip);

			focusTooltip(tip); // Scroll to view.

			toolTipIndex++;

			if (toolTipIndex < toolTips.length) {
				toolTipTimer = setTimeout(showToolTip, toolTips[toolTipIndex].timer);
			} else {
				endOfSlide = true;
				gotToNextSlide();
			}
		}
	}

	function focusTooltip(tip) {
		// IE11 doesn't support the scrollIntoView() extra options unfortunately.
		isIE() ? tip.scrollIntoView(true) : tip.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	function generateTooltip(data) {
		var tooltipLocator = document.createElement('span');
		tooltipLocator.setAttribute('class', 'pulser');
		tooltipLocator.style.top = `${data.top}%`;
		tooltipLocator.style.left = `${data.left}%`;

		var pulser = document.createElement('div');
		pulser.setAttribute('class', 'button');
		pulser.setAttribute('aria-hidden', 'true');
		pulser.style.color = data.color;

		var tooltipContainer = document.createElement('span');
		tooltipContainer.setAttribute('class', `tooltip tooltip-${data.direction} animate`);

		var toolArrow = document.createElement('div');
		toolArrow.setAttribute('class', isIE() ? 'arrow ie' : 'arrow');
		setBorderColor(toolArrow, data.direction, data);

		var tooltipText = document.createElement('span');
		tooltipText.setAttribute('class', 'tooltiptext');
		tooltipText.style.color = data.textColor;
		tooltipText.style.backgroundColor = data.color;
		tooltipText.innerHTML = data.content;

		tooltipText.append(toolArrow);
		tooltipContainer.append(tooltipText);

		tooltipLocator.append(pulser, tooltipContainer);

		return tooltipLocator;
	}

	function setBorderColor(toolArrow, direction, data) {
		switch (direction) {
			case 'up':
				toolArrow.style.borderTopColor = data.color;
				break;
			case 'down':
				toolArrow.style.borderBottomColor = data.color;
				break;
			case 'left':
				toolArrow.style.borderLeftColor = data.color;
				break;
			case 'right':
				toolArrow.style.borderRightColor = data.color;
				break;
			default:
				break;
		}
	}

	function progressNextSlide() {
		slideTimer = setTimeout(handleSlideTransition, slideTransitionDelays[slideIndex]);
	}

	function handleSlideTransition() {
		if (autoPlay && slideIndex < slides.length - 1) {
			nextSlide();
		}
	}

	function isIE() {
		return window.document.documentMode; // DocumentMode is an IE only property (IE9-11)
	}
});
