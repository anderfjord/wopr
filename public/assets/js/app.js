(function() {

    if (!util.supports.data) {
        $('.no-support').show().next().hide();
        return;
    }

    var MODE = 'friend'
      , peer = null
      , peerId = null
      , conn = null
      , turn = false
      , ended = false
      , grid = [ [], [], [], [] ]
      , gridSize = 3
      , headerColors = ['F7701D', 'FF2222', 'FFCE22', 'FFFFFF', 'FFA422', 'FF6422', 'FFFFFF', 'FFF022', 'FF5022', 'FFDA22', 'FE2251', 'FFFFFF', 'FF6122', 'FF4022'];
    
    var opponent = {
        peerId: null
    };

    var DOM = {
        introAudio: $('.shall-we-play-a-game'),
        game: $('#game')
    };

    /**
     * Type a sequence of characters
     */
    var type = function (selector, text, timeInterval) {
        var textParts = text.split('')
          , time = 0;

        textParts.forEach(function (char) {
            setTimeout(function () {
                var el = $(selector)
                  , currentHtml = el.html();

                el.html(currentHtml + char);

            }, time);
            time += timeInterval;
        });
    };

    /**
     * Initialize the game
     */
    var initialize = function () {
        
        peer = new Peer('', {
            host: location.hostname,
            port: location.port || (location.protocol === 'https:' ? 443 : 80),
            path: '/peerjs',
            debug: 3
        });
        
        peer.on('open', function(id) {
            peerId = id;
        });

        peer.on('error', function(err) {
            alert('' + err);
        });
    };

    /**
     * Process a move
     */
    var process = function () {

        var endedBy = null;

        for (var i = 0; i < grid.length && !ended; i++) {

            for (var j = 0; j < gridSize; j++) {
                if(typeof grid[i][j] === 'undefined') {
                    continue
                }

                var match = true
                for(var k = 0; k < 4; k++) {
                    if(grid[i][j] !== grid[i][j+k]) {
                        match = false
                    }
                }
                if(match) {
                    endedBy = grid[i][j]
                    ended = true
                    for(var k = 0; k < 4; k++) {
                        $('.grid tr:eq('+(gridSize-(j+k)-1)+') td:eq('+i+') .slot', DOM.game).addClass('highlight')
                    }
                    break
                }

                match = true
                for(var k = 0; k < 4; k++) {
                    if(i+k >= 7 || grid[i+k] && grid[i][j] !== grid[i+k][j]) {
                        match = false
                    }
                }
                if(match) {
                    endedBy = grid[i][j]
                    ended = true
                    for(var k = 0; k < 4; k++) {
                        $('.grid tr:eq('+(gridSize-j-1)+') td:eq('+(i+k)+') .slot', DOM.game).addClass('highlight')
                    }
                    break
                }

                match = true
                for(var k = 0; k < 4; k++) {
                    if(i+k >= 7 || j+k >= gridSize || grid[i][j] !== grid[i+k][j+k]) {
                        match = false
                    }
                }
                if(match) {
                    endedBy = grid[i][j]
                    ended = true
                    for(var k = 0; k < 4; k++) {
                        $('.grid tr:eq('+(gridSize-(j+k)-1)+') td:eq('+(i+k)+') .slot', DOM.game).addClass('highlight')
                    }
                    break
                }

                match = true
                for(var k = 0; k < 4; k++) {
                    if(i-k < 0 || grid[i][j] !== grid[i-k][j+k]) {
                        match = false
                    }
                }
                if(match) {
                    endedBy = grid[i][j]
                    ended = true
                    for(var k = 0; k < 4; k++) {
                        $('.grid tr:eq('+(gridSize-(j+k)-1)+') td:eq('+(i-k)+') .slot', DOM.game).addClass('highlight')
                    }
                    break
                }
            }
        }

        if (ended) {
            $('.grid', DOM.game).addClass('ended');

            if (endedBy === peerId) {
                $('.alert p', DOM.game).text('You won!');
            } else {
                $('.alert p', DOM.game).text('You lost!');
            }

            // @TODO - highlight success

            turn = false;
        }

        var draw = true;

        $.each(grid, function (i, c) {
            if (c.length < gridSize) {
                draw = false;
            }
        });

        if (draw) {
            type('#game .alert p', 'Stalemate. Want to play again?', 100);
            turn = false;
        }
    };

    /**
     * Start the game
     */
    var begin = function () {
        
        conn.on('data', function (data) {

            switch(data[0]) {
                
                case 'move':
                    if (turn) { return; }

                    var i = data[1];
                    
                    if (grid[i].length == 3) {
                        return;
                    }

                    grid[i].push(opponent.peerId);

                    // $('#game .grid tr:eq(' + (gridSize - grid[i].length) + ') td:eq(' + i + ') .slot').addClass('filled-opponent');
                    $('#game .grid tr:eq(' + (gridSize - grid[i].length) + ') td:eq(' + i + ') .slot').html('<span class="filled-contents">O</span>');
                    $('#game .alert p').text('Your move!');

                    turn = true;

                    process();
                    break;
            }
        });

        conn.on('close', function () {
            if (!ended) {
                $('#game .alert p').text('Opponent forfeited!');
            }
            turn = false;
        });

        peer.on('error', function (err) {
            alert('' + err);
            turn = false;
        });
    };

    /**
     * Trigger start of game
     */
    var start = function () {

        initialize();

        peer.on('open', function() {
            $('#game .alert p').text('Waiting for opponent').append($('<span class="pull-right"></span>').text('Peer ID: ' + peerId));
            $('#game').show().siblings('section').hide();
            alert('Ask your friend to join using your peer ID: ' + peerId);
        });

        peer.on('connection', function(c) {
            if(conn) {
                c.close();
                return;
            }
            conn = c;
            turn = true;
            $('#game .alert p').text('Your move!');
            begin();
        });
    };

    /**
     * Join the game
     */
    var join = function () {

        initialize();

        peer.on('open', function() {

            var destId = prompt("Opponent's peer ID:")
            conn = peer.connect(destId, {
                reliable: true
            });

            conn.on('open', function() {
                opponent.peerId = destId;
                $('#game .alert p').text("Waiting for opponent's move");
                $('#game').show().siblings('section').hide();
                turn = false;
                begin();
            });
        })
    };

    /**
     * Event: click on cell
     */
    $('.grid tr td', DOM.game).on('click', function (ev) {

        ev.preventDefault()
        
        if (!turn) {
            return;
        }

        var i = $(this).index();
        
        if (grid[i].length == gridSize) {
            return;
        }

        grid[i].push(peerId);

        // $('#game .grid tr:eq(' + (gridSize - grid[i].length) + ') td:eq(' + i + ') .slot').addClass('filled');
        $('.grid tr:eq(' + (gridSize - grid[i].length) + ') td:eq(' + i + ') .slot', DOM.game).html('<span class="filled-contents">X</span>');
        $('.alert p', DOM.game).text("Waiting for opponent's move");

        turn = false;

        conn.send(['move', i]);

        process();
    });

    /**
     *
     */
    var reset = function (ev) {
        console.log('RESET');
        ev.preventDefault();
        DOM.game.hide();
        $('#joshua-plays-himself').hide();
        $('#start-options').hide();
        $('#play-a-friend').hide();
        $('.shall-we').html('');
        embedAudioIntro();
        $('#menu').show();
        $('#mode-options').show();
        type('.shall-we', '> Shall we play a game?', 85);
    };

    /**
     *
     */
    var embedAudioIntro = function () {
        DOM.introAudio.html('');
        DOM.introAudio.append('<audio controls autoplay style=""display:none;><source src="/assets/audio/playagame_wg.wav" type="audio/mpeg"></source></audio>');
    };

    /**
     * Event: Play a friend
     */
    $('a[href="#play-a-friend"]').on('click', function (ev) {
        ev.preventDefault();
        $('#mode-options').hide();
        $('#start-options').show();
        $('#play-a-friend').show();
    });

    /**
     * Event: start
     */
    $('a[href="#start"]').on('click', function (ev) {
        ev.preventDefault();
        start();
    });

    /**
     * Event: join
     */
    $('a[href="#join"]').on('click', function (ev) {
        ev.preventDefault();
        join();
    });


    /**
     * Event: Joshua plays himself
     */
    $('a[href="#joshua-plays-himself"]').on('click', function (ev) {
        ev.preventDefault();
        $('#mode-options').hide();
        $('#start-options').show();
        $('#joshua-plays-himself').show();
    });

    /**
     * Event: start Joshua
     */
    $('a[href="#start-joshua"]').on('click', function (ev) {
        ev.preventDefault();

        if (confirm('Are you sure? Joshua lacks all sense of human empathy, unless it\'s possible that he can learn...')) {
            start();
        }
    });

    /**
     * Event: hover over cell
     */
    $('.grid td', DOM.game).on('mouseenter', function () {
        $(this).addClass('hover');
        // $('#game .grid tr td:nth-child(' + ($(this).index() + 1) + ')').addClass('hover');
    });

    $('.grid td', DOM.game).on('mouseleave', function () {
        $(this).removeClass('hover');
        // $('#game .grid tr td:nth-child(' + ($(this).index() + 1) + ')').removeClass('hover');
    });

    $('.wopr-title').on('click', function (ev) {
        reset(ev);
    });

    embedAudioIntro();
    type('.shall-we', '> Shall we play a game?', 85);

    var setHeaderTimeout = function (selector, timeInterval) {

        var randomNum = Math.random()
          , randomColor = Math.floor((randomNum * headerColors.length) + 1)
          , randomTimeInterval = Math.floor((randomNum * 10) + 1) * 1000;

        setTimeout(function () {
            $(selector).css('color', '#' + headerColors[randomColor]);
            setHeaderTimeout(selector, randomTimeInterval);
        }, timeInterval);
    };

    setHeaderTimeout('.wopr-1', 5000);
    setHeaderTimeout('.wopr-2', 3000);
    setHeaderTimeout('.wopr-3', 7000);
    setHeaderTimeout('.wopr-4', 2000);

})();