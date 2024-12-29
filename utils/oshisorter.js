const members = [];
let selectedGenerations = new Set();
let generationHistory = [];
let currentPairIndex = 0;
let sortingInProgress = false;
let remainingPairs = [];
let winnerScores = new Map();
let sortingComplete = false;
const MAX_PAIRS = 30;

function optimizeImageUrl(url) {
    if (url && url.includes('jkt48.com')) {
        const cloudinaryBase = 'https://res.cloudinary.com/dlx2zm7ha/image/fetch/';
        const optimizedParams = 'f_auto,q_auto,w_300'; 
        return `${cloudinaryBase}${optimizedParams}/${encodeURIComponent(url)}`;
    }
    return url;
}


function updateStartButton() {
    const startButton = document.getElementById('start');
    if (sortingInProgress) {
        startButton.style.display = 'none';
        return;
    }
    startButton.style.display = 'block';

    if (sortingComplete) {
        startButton.textContent = 'Reset';
        startButton.className = `
            mt-6 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 
            text-white font-bold rounded-lg shadow-lg 
            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
        `;
    } else {
        startButton.textContent = 'Start';
        startButton.toggleAttribute('disabled', selectedGenerations.size === 0);
        startButton.className = selectedGenerations.size > 0
            ? `mt-6 px-8 py-4 rounded-lg font-bold
                bg-purple-800 text-white border border-purple-900
                dark:bg-purple-900 dark:text-white dark:border-purple-800
                hover:bg-purple-900 hover:border-purple-800
                dark:hover:bg-purple-950 dark:hover:border-purple-700
                transform hover:scale-105 hover:shadow-md
                transition-all duration-300`
            : `mt-6 px-8 py-4 rounded-lg font-bold
                bg-gray-100 text-gray-400 border border-gray-300
                dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600
                cursor-not-allowed
                transition-all duration-300`;
    }
}

function getFilteredMembers() {
    return members.filter(member => selectedGenerations.has(member.generation.toString()));
}

function generatePairs(members) {
    const pairs = [];
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);

    const selectedMembers = shuffledMembers.length > 10
        ? shuffledMembers.slice(0, 10)
        : shuffledMembers;

    for (let i = 0; i < selectedMembers.length; i++) {
        for (let j = i + 1; j < selectedMembers.length; j++) {
            pairs.push([selectedMembers[i], selectedMembers[j]]);
            if (pairs.length >= MAX_PAIRS) break;
        }
        if (pairs.length >= MAX_PAIRS) break;
    }

    return pairs.sort(() => Math.random() - 0.5);
}

async function loadMembers() {
    const response = await fetch('/data/member.json');
    const data = await response.json();
    members.push(...data);

    const generations = [...new Set(data.map(member => member.generation))];
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const undoButton = document.createElement('button');
    undoButton.className = `
        px-2 py-2 mb-4 rounded-lg font-medium text-xs
        bg-red-100 text-red-800 border border-red-400
        dark:bg-gray-700 dark:text-red-400
        hover:bg-red-200 hover:border-red-500 hover:shadow-md
        dark:hover:bg-gray-600 dark:hover:border-red-300
        transform hover:scale-105
        transition-all duration-300
    `;
    undoButton.textContent = 'Undo Last Selection';
    undoButton.onclick = undoLastGeneration;
    filterButtonsContainer.appendChild(undoButton);

    const genList = document.createElement('div');
    genList.className = 'grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

    generations.forEach(gen => {
        const button = document.createElement('button');
        button.className = `
            w-full px-6 py-3 rounded-lg font-medium text-xs
            bg-purple-100 text-purple-800 border border-purple-400
            dark:bg-gray-700 dark:text-purple-400
            hover:bg-purple-800 hover:text-white hover:border-purple-900
            dark:hover:bg-purple-900 dark:hover:text-white dark:hover:border-purple-800
            transform hover:scale-105 hover:shadow-md
            transition-all duration-300
        `;
        button.textContent = `${gen}`;
        button.dataset.gen = gen;
        button.classList.add('gen-btn');
        genList.appendChild(button);

        button.addEventListener('click', () => toggleGeneration(gen));
    });
    filterButtonsContainer.appendChild(genList);
}

function toggleGeneration(gen) {
    if (selectedGenerations.has(gen)) {
        selectedGenerations.delete(gen);
        generationHistory = generationHistory.filter(g => g !== gen);
    } else {
        selectedGenerations.add(gen);
        generationHistory.push(gen);
    }
    updateGenerationUI();
    updateStartButton();
}

function undoLastGeneration() {
    if (generationHistory.length > 0) {
        const lastGen = generationHistory.pop();
        selectedGenerations.delete(lastGen);
        updateGenerationUI();
        updateStartButton();
    }
}

function updateGenerationUI() {
    document.querySelectorAll('.gen-btn').forEach(btn => {
        const isSelected = selectedGenerations.has(btn.dataset.gen);
        btn.className = isSelected
            ? `gen-btn w-full px-6 py-3 rounded-lg font-semibold
                bg-purple-800 text-white border-2 border-purple-900
                dark:bg-purple-900 dark:text-white dark:border-purple-800
                hover:bg-purple-900 hover:border-purple-800
                dark:hover:bg-purple-950 dark:hover:border-purple-700
                transform hover:scale-105 hover:shadow-md
                transition-all duration-300`
            : `gen-btn w-full px-6 py-3 rounded-lg font-medium text-xs
                bg-purple-100 text-purple-800 border border-purple-400
                dark:bg-gray-700 dark:text-purple-400
                hover:bg-purple-800 hover:text-white hover:border-purple-900
                dark:hover:bg-purple-900 dark:hover:text-white dark:hover:border-purple-800
                transform hover:scale-105 hover:shadow-md
                transition-all duration-300`;
    });
    resetDisplay();
}

function resetDisplay() {
    if (sortingInProgress) {
        ['card1', 'card2', 'result', 'progress-display'].forEach(id => {
            document.getElementById(id).innerHTML = '';
        });
    } else {
        ['card1', 'card2', 'result', 'progress-display'].forEach(id => {
            if (id === 'progress-display') {
                document.getElementById(id).innerHTML = '';
            } else {
                const element = document.getElementById(id);
                element.innerHTML = sortingComplete ? '' : '<p class="text-xl font-bold">Click Start to Begin</p>';
            }
        });
    }
}

function displayPair(pair) {
    const cardTemplate = (member, index) => `
        <div class="w-full h-full flex flex-col items-center cursor-pointer" role="button" tabindex="0" onclick="selectWinner(${index})">
            <div class="relative w-full h-full overflow-hidden rounded-t-lg">
                <img src='${optimizeImageUrl(member.img_alt)}' 
                        alt='${member.name}' 
                        class='w-full h-full object-cover'
                        loading="lazy"
                        onerror="this.src='https://jkt48.com/images/logo.svg'">
            </div>
            <div class="w-full bg-gradient-to-r from-red-500 to-red-600 p-4">
                <p class='text-sm font-bold text-white'>${member.name}</p>
                <p class='text-sm text-white opacity-90'>${member.generation}</p>
            </div>
        </div>`;

    document.getElementById('card1').innerHTML = cardTemplate(pair[0], 0);
    document.getElementById('card2').innerHTML = cardTemplate(pair[1], 1);
}

function selectWinner(index) {
    if (!sortingInProgress) return;

    const winner = remainingPairs[currentPairIndex][index];
    winnerScores.set(winner.name, (winnerScores.get(winner.name) || 0) + 1);

    currentPairIndex++;
    if (currentPairIndex < remainingPairs.length) {
        displayPair(remainingPairs[currentPairIndex]);
        updateProgress();
    } else {
        endSorting();
    }
}

function updateProgress() {
    const progress = Math.round((currentPairIndex / remainingPairs.length) * 100);
    document.getElementById('progress-display').textContent = `Progress: ${progress}%`;
}

function getBorderColor(index) {
    return ['border-yellow-400', 'border-gray-300', 'border-yellow-600', 'border-purple-500'][index] || 'border-purple-500';
}

function generateShareableLink(sortedMembers) {
    const compactData = sortedMembers.map(member => [
        member.name,
        member.generation,
        member.img_alt
    ]);
    const encodedData = btoa(JSON.stringify(compactData));
    const baseUrl = 'https://finland-miracle.vercel.app/share';
    return `${baseUrl}?d=${encodedData}`;
}

function decodeShareData() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('d');
    if (!encodedData) return null;
    
    try {
        const decodedData = JSON.parse(atob(encodedData));
        return decodedData.map(([name, generation, img]) => ({
            name,
            generation,
            img
        }));
    } catch (e) {
        console.error('Failed to decode share data:', e);
        return null;
    }
}

function copyShareLink() {
    const input = document.getElementById('share-link-input');
    input.select();
    document.execCommand('copy');

    const button = input.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Tersalin!';
    button.classList.add('bg-green-600');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600');
    }, 2000);
}

function endSorting() {
    sortingInProgress = false;
    sortingComplete = true;

    const sortedMembers = Array.from(winnerScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => members.find(m => m.name === name));

    document.getElementById('result').innerHTML = `
        <div class='text-center'>
            <h2 class='text-3xl font-bold mb-6'>Your Top 5 Picks!</h2>
            <div class='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
                ${sortedMembers.map((member, index) => `
                    <div class='flex flex-col items-center'>
                        <img src='${optimizeImageUrl(member.img_alt)}' 
                                alt='${member.name}' 
                                class='w-24 h-24 object-cover rounded-full border-4 ${getBorderColor(index)}'
                                loading="lazy"
                                onerror="this.src='https://jkt48.com/images/logo.svg'">
                        <p class='font-bold'>${member.name}</p>
                        <p class='text-sm text-gray-600'>${member.generation}</p>
                    </div>`).join('')}
            </div>
            <div class="mt-6 p-4 bg-white rounded-lg shadow-md">
                <p class="text-lg font-semibold mb-4">Bagikan Hasil Anda:</p>
                <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div class="flex-1 w-full">
                        <input type="text" 
                            value="${generateShareableLink(sortedMembers)}" 
                            readonly 
                            class="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none"
                            id="share-link-input">
                    </div>
                    <button onclick="copyShareLink()" 
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Salin Link
                    </button>
                </div>
                <div class="mt-4 flex justify-center gap-4">
                    <a href="https://twitter.com/intent/tweet?text=Cek hasil Intens Oshi Sorter saya!&url=${encodeURIComponent(generateShareableLink(sortedMembers))}" 
                        target="_blank" 
                        class="text-blue-600 hover:text-blue-800">
                        <i class="fab fa-twitter"></i> Tweet
                    </a>
                </div>
            </div>
        </div>`;

    updateStartButton();
    document.getElementById('progress-display').textContent = 'Intens Oshi shorter selesai';
}

function resetSorting() {
    sortingInProgress = false;
    sortingComplete = false;
    winnerScores.clear();
    selectedGenerations.clear();
    generationHistory = [];
    currentPairIndex = 0;
    remainingPairs = [];
    updateGenerationUI();
    updateStartButton();
    resetDisplay();
}


function showNotification(message) {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = `
        fixed top-16 right-4 z-50 flex items-center bg-purple-800 text-white
        px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 opacity-0
        sm:top-20 sm:right-6 max-w-xs w-full sm:max-w-sm
    `;
    
    notificationContainer.innerHTML = `
        <div class="flex items-center w-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0h.01M12 15h.01M21.75 12A9.75 9.75 0 1112 2.25 9.75 9.75 0 0121.75 12z" />
            </svg>
            <span class="text-sm sm:text-base break-words">${message}</span>
        </div>
    `;

    document.body.appendChild(notificationContainer);
    setTimeout(() => {
        notificationContainer.style.opacity = '1';
        notificationContainer.style.transform = 'translateY(0)';
    }, 50);
    setTimeout(() => {
        notificationContainer.style.opacity = '0';
        notificationContainer.style.transform = 'translateY(10px)';
        setTimeout(() => notificationContainer.remove(), 300);
    }, 3000);
}

function startSorting() {
    if (sortingComplete) {
        resetSorting();
        return;
    }

    if (selectedGenerations.size === 0) {
        showNotification('Silahkan pilih gen berapa yang ingin ada shorter');
        return;
    }

    sortingInProgress = true;
    resetDisplay();
    updateStartButton();
    winnerScores.clear();

    const filteredMembers = getFilteredMembers();
    remainingPairs = generatePairs(filteredMembers);
    currentPairIndex = 0;

    if (remainingPairs.length === 0) {
        sortingInProgress = false;
        updateStartButton();
        resetDisplay();
        showNotification('Membernya kurang silahkan pilih gen lainnya lagi');
        return;
    }

    displayPair(remainingPairs[0]);
    updateProgress();
}

document.getElementById('start').addEventListener('click', startSorting);


loadMembers();