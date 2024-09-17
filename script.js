const questions = [
    "The sun is bright",
    "I like to eat",
    "We are learning",
    "Time goes fast"
];
const answers = [
    "Meka sora tulu",
    "Nira fola kep",
    "Lusa veni tora",
    "Zima kola peri"
];
let currentQuestion = 0;

const questionEl = document.getElementById('question');
const userInputEl = document.getElementById('userInput');
const checkButtonEl = document.getElementById('checkButton');
const feedbackEl = document.getElementById('feedback');
const correctAnswerEl = document.getElementById('correctAnswer');
const overlayEl = document.getElementById('overlay');
const backgroundMusicEl = document.getElementById('backgroundMusic');
const bodyEl = document.body;
const currentSongEl = document.getElementById('currentSong');
const songListEl = document.getElementById('songList');

const songs = [
    { title: "LURN 2 LUVVV", file: "/lurn2luv.mp3" },
    { title: "NVR", file: "/NVR.mp3" },
    { title: "SUNBURN", file: "/sunburn.mp3" },
    { title: "Days ovr the sun", file: "/daysoverthesun.mp3" }
];

function updateQuestion() {
    questionEl.textContent = questions[currentQuestion];
    userInputEl.value = '';
    feedbackEl.textContent = '';
    correctAnswerEl.textContent = `Correct answer: ${answers[currentQuestion]}`;
}

function showOverlay(color) {
    overlayEl.style.backgroundColor = color;
    overlayEl.style.opacity = '0.3';
    setTimeout(() => {
        overlayEl.style.opacity = '0';
    }, 500);
}

function checkAnswer() {
    const userAnswer = userInputEl.value.toLowerCase();
    const correctAnswer = answers[currentQuestion].toLowerCase();
    if (userAnswer === correctAnswer) {
        feedbackEl.textContent = '✅';
        feedbackEl.className = 'text-2xl text-green-500';
        showOverlay('rgba(0, 255, 0, 0.3)');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            currentQuestion = (currentQuestion + 1) % questions.length;
            updateQuestion();
        }, 2000); // Move to next question after 2 seconds
    } else {
        feedbackEl.textContent = '❌';
        feedbackEl.className = 'text-2xl text-red-500';
        bodyEl.classList.add('shake');
        showOverlay('rgba(255, 0, 0, 0.3)');
        setTimeout(() => {
            bodyEl.classList.remove('shake');
        }, 500);
    }
}

function createSongList() {
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.onclick = () => playSong(index);
        songListEl.appendChild(li);
    });
}

function playSong(index) {
    const song = songs[index];
    backgroundMusicEl.src = song.file;
    backgroundMusicEl.load(); // Explicitly load the audio
    backgroundMusicEl.play()
        .then(() => {
            console.log(`Now playing: ${song.title}`);
            currentSongEl.textContent = song.title;
            if (!audioContext) {
                initAudio();
            }
        })
        .catch(e => {
            console.error("Error playing audio:", e);
            currentSongEl.textContent = `Error playing: ${song.title}`;
            alert(`Error playing ${song.title}. Check console for details.`);
        });
    
    // Update active song in the list
    Array.from(songListEl.children).forEach((li, i) => {
        if (i === index) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
}

checkButtonEl.addEventListener('click', checkAnswer);
userInputEl.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Audio visualization
let audioContext, analyser, source;

function initAudio() {
    if (audioContext) {
        return;
    }

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaElementSource(backgroundMusicEl);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = document.getElementById('audioWaves');
        const canvasCtx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 60;

        function drawAudioWaves() {
            requestAnimationFrame(drawAudioWaves);

            analyser.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = 'rgb(255, 255, 255)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
                canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

                x += barWidth + 1;
            }
        }

        drawAudioWaves();
    } catch (error) {
        console.error("Error initializing audio:", error);
        alert("There was an error initializing audio. Please check the console for details.");
    }
}

// Initialize audio context on user interaction
document.body.addEventListener('click', () => {
    if (!audioContext) {
        initAudio();
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });

const volumeControl = document.getElementById('volume');
volumeControl.addEventListener('input', () => {
    backgroundMusicEl.volume = volumeControl.value;
});

function checkAudio() {
    const audio = new Audio();
    const canPlayMP3 = audio.canPlayType('audio/mpeg') !== '';
    if (!canPlayMP3) {
        alert("Your browser doesn't support MP3 playback. Please try a different browser.");
    }
}

window.onload = function() {
    checkAudio();
    createSongList();
    updateQuestion();
};
