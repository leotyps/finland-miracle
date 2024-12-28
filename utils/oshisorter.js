const members = [];
let selectedGenerations = new Set();
let currentPairIndex = 0;
let sortingInProgress = false;
let remainingPairs = [];
let winnerScores = new Map();
let sortingComplete = false;

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
            ? `mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`
            : `mt-6 px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 font-bold rounded-lg cursor-not-allowed`;
    }
}

function getFilteredMembers() {
    return members.filter(member => selectedGenerations.has(member.generation.toString()));
}

function generatePairs(members) {
    const pairs = [];
    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            pairs.push([members[i], members[j]]);
        }
    }
    return pairs.sort(() => Math.random() - 0.5);
}

async function loadMembers() {
    const response = await fetch('/data/member.json');
    const data = await response.json();
    members.push(...data);

    const generations = [...new Set(data.map(member => member.generation))];
    const filterButtonsContainer = document.getElementById('filter-buttons');

    const genList = document.createElement('div');
    genList.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

    generations.forEach(gen => {
        const button = document.createElement('button');
        button.className = `
            gen-btn w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300
            bg-gradient-to-r from-gray-100 to-gray-200 hover:from-purple-500 hover:to-purple-600 hover:text-white
        `;
        button.textContent = `${gen}`;
        button.dataset.gen = gen;
        genList.appendChild(button);

        button.addEventListener('click', () => toggleGeneration(gen));
    });

    filterButtonsContainer.appendChild(genList);
}

function toggleGeneration(gen) {
    selectedGenerations.has(gen) ? selectedGenerations.delete(gen) : selectedGenerations.add(gen);
    updateGenerationUI();
    updateStartButton();
}

function updateGenerationUI() {
    document.querySelectorAll('.gen-btn').forEach(btn => {
        const isSelected = selectedGenerations.has(btn.dataset.gen);
        btn.className = isSelected
            ? `gen-btn w-full px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-purple-500`
            : `gen-btn w-full px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-gray-100 to-gray-200 hover:from-purple-500 hover:to-purple-600 hover:text-white`;
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
                <img src='${member.img_alt}' alt='${member.name}' class='w-full h-full object-cover' onerror="this.src='https://jkt48.com/images/logo.svg'">
            </div>
            <div class="w-full bg-gradient-to-r from-red-500 to-red-600 p-4">
                <p class='text-xl font-bold text-white'>${member.name}</p>
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
                        <img src='${member.img_alt}' alt='${member.name}' class='w-24 h-24 object-cover rounded-full border-4 ${getBorderColor(index)}' onerror="this.src='https://jkt48.com/images/logo.svg'">
                        <p class='font-bold'>${member.name}</p>
                        <p class='text-sm text-gray-600'>${member.generation}</p>
                    </div>`).join('')}
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
    currentPairIndex = 0;
    remainingPairs = [];
    updateGenerationUI();
    updateStartButton();
    resetDisplay();
}

document.getElementById('start').addEventListener('click', () => {
    if (sortingComplete) {
        resetSorting();
        return;
    }

    if (selectedGenerations.size === 0) {
        return alert('Silahkan pilih gen berapa yang ingin ada shorter');
    }
    
    sortingInProgress = true;
    resetDisplay(); 
    updateStartButton(); 
    winnerScores.clear();
    remainingPairs = generatePairs(getFilteredMembers());
    currentPairIndex = 0;

    if (remainingPairs.length === 0) {
        sortingInProgress = false;
        updateStartButton();
        resetDisplay();
        return alert('Membernya kurang silahkan pilih gen lainnya lagi ');
    }

    displayPair(remainingPairs[0]);
    updateProgress();
});

loadMembers();