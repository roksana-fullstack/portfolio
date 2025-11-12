document.addEventListener("DOMContentLoaded", () => {
	const hero = document.getElementById('hero');
	const video = document.getElementById('hero-video');
	if (!hero || !video) return;

	// Configuration: crossfade length (seconds)
	const CROSSFADE = 1.0; // tweak between 0.5 - 2.0

	// Prepare primary video
	video.muted = true;
	video.playsInline = true;
	video.loop = false; // we'll manage looping to avoid hard jump
	video.preload = 'auto';
	video.style.transition = `opacity ${CROSSFADE}s linear`;
	video.style.opacity = 1;
	// optional playback speed
	video.playbackRate = 0.7;

	// Create a second video element for crossfading
	const v2 = video.cloneNode(true);
	v2.id = 'hero-video-2';
	v2.loop = false;
	v2.autoplay = false;
	v2.muted = true;
	v2.playsInline = true;
	v2.preload = 'auto';
	v2.style.opacity = 0;
	v2.style.transition = `opacity ${CROSSFADE}s linear`;

	// Append the second video to the hero container
	hero.appendChild(v2);

	let active = video;
	let standby = v2;

	// Start playback of the active video
	const start = () => {
		const p = active.play();
		if (p && typeof p.catch === 'function') p.catch(() => {});
		watchForCrossfade();
	};

	function watchForCrossfade() {
		function onTimeUpdate() {
			if (!active.duration || active.duration === Infinity) return;
			// when within CROSSFADE seconds of the end, start the standby
			if (active.currentTime >= active.duration - CROSSFADE - 0.05) {
				active.removeEventListener('timeupdate', onTimeUpdate);
				// prepare standby
				standby.currentTime = 0;
				standby.playbackRate = active.playbackRate;
				const p = standby.play();
				if (p && typeof p.catch === 'function') p.catch(() => {});
				// crossfade
				standby.style.opacity = '1';
				active.style.opacity = '0';
				// after crossfade, pause the previous active and swap
				setTimeout(() => {
					try {
						active.pause();
						active.currentTime = 0;
					} catch (e) {}
					// swap references
					const tmp = active;
					active = standby;
					standby = tmp;
					// ensure standby is hidden and ready for next crossfade
					standby.style.opacity = '0';
					watchForCrossfade();
				}, CROSSFADE * 1000 + 50);
			}
		}
		active.addEventListener('timeupdate', onTimeUpdate);
	}

	// Safety: if an 'ended' fires (older browsers), immediately swap
	[v2, video].forEach((v) => {
		v.addEventListener('ended', () => {
			// ensure the other video is visible/playing
			if (v === active) return;
			active.style.opacity = '1';
			standby.style.opacity = '0';
		});
	});

	start();
});
