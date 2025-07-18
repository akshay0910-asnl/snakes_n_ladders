(() => {
    const grid = document.getElementById('grid');
    const gamePanel = document.getElementById('gamePanel');
    const playerThrow = document.getElementById('playerThrow');
    const stepsInARow = 10, totalSteps = 100;
    const ladders = [{ start: 4, end: 25 }, { start: 21, end: 39 }, { start: 29, end: 74 }, { start: 43, end: 76 }, { start: 63, end: 80 },
    { start: 71, end: 89 }], snakes = [{ start: 30, end: 7 }, { start: 47, end: 15 }, { start: 56, end: 19 }, { start: 73, end: 51 }, { start: 82, end: 42 },
    { start: 92, end: 75 }, { start: 98, end: 55 }]
    let player1Color, player2Color;
    const ranges = [...Array(totalSteps).keys()].map(x => x + 1);
    let player1Position = 1, player2Position = 1, player1Chance = true, player2Chance = false;
    let currentCubeClass = '', cube;

    const getLabel = (value, maxValue) => {
        let initialLabel = maxValue - value + 1;
        const tenMultipleFromMaxValue = Math.floor((initialLabel - 1) / stepsInARow);
        if (tenMultipleFromMaxValue % 2 === 0) {
            const remainder = Math.ceil((initialLabel - 1) % stepsInARow);
            const adjustedRemainder = 10 - remainder;
            initialLabel = (initialLabel - 1) - remainder + adjustedRemainder;
        }
        return initialLabel;
    }

    const getCoinIncrement = () => {
        return Math.floor(Math.random() * 6 + 1);
    }

    const appendCoinToGrid = (index, color) => {
        const playerCoin = document.createElement('div');
        playerCoin.classList.add('coin');
        playerCoin.classList.add(`player${index}Coin`);
        playerCoin.setAttribute('id', `player${index}Coin`);
        playerCoin.style.backgroundColor = color;
        grid.appendChild(playerCoin);
    }

    const setCoinPositions = (player1Position, player2Position, currentCoinIndex, firstSetup = false, ifPreviouslyEqual = false) => {
        let otherCoinIndex = currentCoinIndex === 1 ? 2 : 1;
        if (player1Position === player2Position) {
            const { left, top } = calculateTopAndLeftParametersGivenStep(player1Position, true);
            const { height: gridHeight } = grid.getBoundingClientRect();
            document.querySelector(`#player1Coin`).style.left = document.querySelector(`#player2Coin`).style.left
                = `${left}%`;
            document.querySelector(`#player1Coin`).style.top = `${top}%`;
            document.querySelector(`#player2Coin`).style.top = `${top + (30 * 100) / gridHeight}%`;
        }
        else {
            const { left, top } = calculateTopAndLeftParametersGivenStep
                (currentCoinIndex === 1 ? player1Position : player2Position, false);
            let currentCoin = document.querySelector(`#player${currentCoinIndex}Coin`);
            let otherCoin = document.querySelector(`#player${otherCoinIndex}Coin`);
            currentCoin.style.left = `${left}%`;
            currentCoin.style.top = `${top}%`;
            if (ifPreviouslyEqual) {
                const { top } = calculateTopAndLeftParametersGivenStep
                    (currentCoinIndex === 1 ? player2Position : player1Position, false);
                otherCoin.style.top = `${top}%`;
            }
        }
    }

    const handleButtons = (index) => {
        const otherIndex = index === 1 ? 2 : 1;
        player1Chance = otherIndex === 1;
        player2Chance = otherIndex === 2;
        if (player1Chance) {
            document.getElementById('player2Throw').disabled = true;
            document.getElementById('player1Throw').disabled = false;
            return;
        }
        document.getElementById('player1Throw').disabled = true;
        document.getElementById('player2Throw').disabled = false;
    }

    const handleSnakesAndLadders = (index, ifPreviouslyEqual) => {
        const concernedPosition = index === 1 ? player1Position : player2Position;
        const relevantSnake = snakes.find(snake => snake.start === concernedPosition);
        if (relevantSnake) {
            (index === 1) ? player1Position = relevantSnake.end :
                player2Position = relevantSnake.end;
            setTimeout(() => setCoinPositions(player1Position, player2Position, index, false, ifPreviouslyEqual), 1100);
        }
        else {
            const relevantLadder = ladders.find(ladder => ladder.start === concernedPosition);
            if (relevantLadder) {
                (index === 1) ? player1Position = relevantLadder.end : player2Position = relevantLadder.end;
                setTimeout(() => setCoinPositions(player1Position, player2Position, index, false, ifPreviouslyEqual), 1100);
            }
        }
    }

    const calculateTopAndLeftParametersGivenStep = (step, ifBothCoinsInvolved) => {
        const dataStep = document.querySelector(`[data-step="${step}"]`);
        if (!dataStep) {
            return false;
        }
        const gridBoundingRect = grid.getBoundingClientRect();
        const dataStepBoundingRect = dataStep.getBoundingClientRect();
        let left = dataStepBoundingRect.left - gridBoundingRect.left;
        let leftOffset = (dataStepBoundingRect.width - 20) / 2;
        left += leftOffset;
        let top = dataStepBoundingRect.top - gridBoundingRect.top, top2;
        let coinCointainer = (ifBothCoinsInvolved) ? 20 * 2 + 10 : 20;
        let topOffset = (dataStepBoundingRect.height - coinCointainer) / 2
        top += topOffset;
        return { left: ((left * 100) / gridBoundingRect.width), top: ((top * 100) / gridBoundingRect.height) };
    }

    const initiatePlay = () => {
        gamePanel.classList.remove('initiateGame');
        gamePanel.classList.add('selectColors');
        document.getElementById('selectColor').addEventListener('click', selectColors, { once: true });
    }

    const selectColors = () => {
        player1Color = document.getElementById('player1Color').value;
        player2Color = document.getElementById('player2Color').value;
        if (player1Color === player2Color) {
            document.getElementById('errorMsg').style.display = 'block';
            setTimeout(() => {
                if (document.getElementById('errorMsg')) {
                    document.getElementById('errorMsg').style.display = 'none';
                }
            }, 2000)
            return;
        }
        gamePanel.classList.remove('selectColors');
        gamePanel.classList.add('startGame');
        document.getElementById('start').addEventListener('click', startGame, { once: true });
    }

    const startGame = () => {
        document.querySelector('.gamePanel').remove();
        playerThrow.classList.remove('hide');
        appendCoinToGrid(1, player1Color);
        appendCoinToGrid(2, player2Color);
        setCoinPositions(player1Position, player2Position, 1, true);
        cube = document.querySelector('.cube');
        document.getElementById('player1Throw').addEventListener('click', () => handlePlayerThrow(1));
        document.getElementById('player2Throw').addEventListener('click', () => handlePlayerThrow(2));
    }

    const handlePlayerThrow = (index) => {
        const ifPreviouslyEqual = player1Position === player2Position;
        const increment = getCoinIncrement(index);
        rollDice(increment);
        if (index === 1) {
            if (player1Position + increment > totalSteps) {
                handleButtons(index);
                return;
            }
            player1Position += increment;
        }
        else {
            if (player2Position + increment > totalSteps) {
                handleButtons(index);
                return;
            }
            player2Position += increment;
        }
        if (increment === 6) {
            return;
        }
        setCoinPositions(player1Position, player2Position, index, false, ifPreviouslyEqual);
        handleSnakesAndLadders(index, ifPreviouslyEqual);
        handleButtons(index);
        if (player1Position === 100) {
            setTimeout(() => {
                alert('Player1 wins'); window.location.reload();
            }, 1100)
        }
        else if (player2Position === 100) {
            setTimeout(() => {
                alert('Player2 wins'); window.location.reload();
            }, 1100)
        }
    }

    const rollDice = (number) => {
        let showClass = 'show-' + number;
        if (currentCubeClass) {
            cube.classList.remove(currentCubeClass);
        }
        cube.classList.add(showClass);
        currentCubeClass = showClass;
    }

    window.onunload = (event) => {
        document.getElementById('player1Throw').removeEventListener('click', () => handlePlayerThrow(1));
        document.getElementById('player2Throw').removeEventListener('click', () => handlePlayerThrow(2));
    };

    ranges.forEach(range => {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        const label = getLabel(range, ranges.length);
        gridItem.innerText = label;
        gridItem.setAttribute('data-step', label);
        grid.appendChild(gridItem);
    });

    document.getElementById('play').addEventListener('click', initiatePlay, { once: true });

    // Add the API button after the grid is rendered
    const apiBtn = document.createElement('button');
    apiBtn.id = 'callApiBtn';
    apiBtn.innerText = 'Call Order API';
    apiBtn.style.margin = '20px';
    grid.parentNode.insertBefore(apiBtn, grid.nextSibling);

    apiBtn.addEventListener('click', async () => {
        const url = 'https://dristi-kerala-dev.pucar.org/egov-pdf/order?tenantId=kl&orderId=193580cd-f18e-4376-9147-61e7ce10f72d&cnrNumber=KLKM520003692025&qrCode=false&courtId=KLKM52';
        const body = {
            "RequestInfo": {
                "authToken": "a25906ce-68f8-4bf4-8bf9-ae9298f67fad",
                "userInfo": {
                    "id": 2559,
                    "uuid": "03919712-b283-4430-a83b-50e9ed59529f",
                    "userName": "michaelGeorgeJudge",
                    "name": "Michael George Dev",
                    "mobileNumber": "6262626262",
                    "emailId": "gihiha1727^@benznoi.com",
                    "locale": null,
                    "type": "EMPLOYEE",
                    "roles": [
                        {"name":"Super User","code":"SUPERUSER","tenantId":"kl"},
                        {"name":"DIARY_APPROVER","code":"DIARY_APPROVER","tenantId":"kl"},
                        {"name":"HEARING_VIEWER","code":"HEARING_VIEWER","tenantId":"kl"},
                        {"name":"WORKFLOW_ABANDON","code":"WORKFLOW_ABANDON","tenantId":"kl"},
                        {"name":"ORDER_ESIGN","code":"ORDER_ESIGN","tenantId":"kl"},
                        {"name":"Workflow Admin","code":"WORKFLOW_ADMIN","tenantId":"kl"},
                        {"name":"APPLICATION_CREATOR","code":"APPLICATION_CREATOR","tenantId":"kl"},
                        {"name":"DEPOSITION_PUBLISHER","code":"DEPOSITION_PUBLISHER","tenantId":"kl"},
                        {"name":"HEARING_APPROVER","code":"HEARING_APPROVER","tenantId":"kl"},
                        {"name":"SUBMISSION_RESPONDER","code":"SUBMISSION_RESPONDER","tenantId":"kl"},
                        {"name":"ORDER_VIEWER","code":"ORDER_VIEWER","tenantId":"kl"},
                        {"name":"ORDER_REASSIGN","code":"ORDER_REASSIGN","tenantId":"kl"},
                        {"name":"CASE_EDITOR","code":"CASE_EDITOR","tenantId":"kl"},
                        {"name":"TASK_CREATOR","code":"TASK_CREATOR","tenantId":"kl"},
                        {"name":"APPLICATION_APPROVER","code":"APPLICATION_APPROVER","tenantId":"kl"},
                        {"name":"DIARY_VIEWER","code":"DIARY_VIEWER","tenantId":"kl"},
                        {"name":"Employee","code":"EMPLOYEE","tenantId":"kl"},
                        {"name":"ORDER_DELETE","code":"ORDER_DELETE","tenantId":"kl"},
                        {"name":"SUPPORT_ADMIN","code":"SUPPORT_ADMIN","tenantId":"kl"},
                        {"name":"NOTIFICATION_APPROVER","code":"NOTIFICATION_APPROVER","tenantId":"kl"},
                        {"name":"CASE_VIEWER","code":"CASE_VIEWER","tenantId":"kl"},
                        {"name":"PDF_CREATOR","code":"PDF_CREATOR","tenantId":"kl"},
                        {"name":"TASK_EDITOR","code":"TASK_EDITOR","tenantId":"kl"},
                        {"name":"APPLICATION_REJECTOR","code":"APPLICATION_REJECTOR","tenantId":"kl"},
                        {"name":"HEARING_EDITOR","code":"HEARING_EDITOR","tenantId":"kl"},
                        {"name":"BAIL_BOND_VIEWER","code":"BAIL_BOND_VIEWER","tenantId":"kl"},
                        {"name":"DIARY_EDITOR","code":"DIARY_EDITOR","tenantId":"kl"},
                        {"name":"ORDER_APPROVER","code":"ORDER_APPROVER","tenantId":"kl"},
                        {"name":"NOTIFICATION_CREATOR","code":"NOTIFICATION_CREATOR","tenantId":"kl"},
                        {"name":"HEARING_CREATOR","code":"HEARING_CREATOR","tenantId":"kl"},
                        {"name":"ORDER_CREATOR","code":"ORDER_CREATOR","tenantId":"kl"},
                        {"name":"EVIDENCE_CREATOR","code":"EVIDENCE_CREATOR","tenantId":"kl"},
                        {"name":"CALCULATION_VIEWER","code":"CALCULATION_VIEWER","tenantId":"kl"},
                        {"name":"JUDGE_ROLE","code":"JUDGE_ROLE","tenantId":"kl"},
                        {"name":"EVIDENCE_EDITOR","code":"EVIDENCE_EDITOR","tenantId":"kl"},
                        {"name":"CASE_APPROVER","code":"CASE_APPROVER","tenantId":"kl"},
                        {"name":"SUBMISSION_APPROVER","code":"SUBMISSION_APPROVER","tenantId":"kl"},
                        {"name":"TASK_VIEWER","code":"TASK_VIEWER","tenantId":"kl"},
                        {"name":"HEARING_SCHEDULER","code":"HEARING_SCHEDULER","tenantId":"kl"},
                        {"name":"BAIL_BOND_APPROVER","code":"BAIL_BOND_APPROVER","tenantId":"kl"}
                    ],
                    "active": true,
                    "tenantId": "kl",
                    "permanentCity": null
                },
                "msgId": "1752835712346|en_IN",
                "apiId": "Rainmaker"
            }
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'content-type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            console.log('API Response:', data);
            alert('API call successful! Check console for response.');
        } catch (error) {
            console.error('API Error:', error);
            alert('API call failed. Check console for error.');
        }
    });

})();