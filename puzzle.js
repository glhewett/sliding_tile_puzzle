// Puzzle constructor
function Puzzle (width, height) {
    this.initialize(width, height);
}

Puzzle.prototype.initialize = function(width, height) {
    this.play_started = false;
    this.timer_started = false;
    this.move_count = 0;   
    this.image_count = 4;
    this.image_path = this.getImagePath();
    this.createGameBoard(width,height);
    this.placeTiles();
    this.blank = this.findBlank();
    this.shuffleBoard(100);
    this.startPlaying();
}

Puzzle.prototype.startPlaying = function() {
    this.play_started = true;
    this.timer_started = false;
    this.move_count = 0;
}

Puzzle.prototype.stopPlaying = function() {
    this.stopTimer();
}

Puzzle.prototype.findBlank = function() {
    var cells = $$('div.cell');

    for (var i=0;i < cells.length; i++) {
        if (cells[i].descendants().length == 0) {
            cells[i].addClassName('blank');
            return cells[i];
        }
    }
    return null;
}

Puzzle.prototype.startTimer = function() {
    this.timer_started = true;
    var start_time = new Date();

    this.Timer = new PeriodicalExecuter(function(pe) {
        var now = new Date(); 
        var diff = now - start_time;
        var minutes = Math.floor(diff/(1000*60));
        var seconds = Math.round((diff % (1000*60))/1000);
        $('time_elapsed').update('Time: ' + minutes + ":" + seconds); 
    }, 1);
}

Puzzle.prototype.stopTimer = function() {
    this.Timer.stop();
}

Puzzle.prototype.clickCell = function(ev) {
    this.moveTile(Event.element(ev))

    if (!this.timer_started) {
        this.startTimer();
    }

    if (this.isFinished()) {
        this.stopPlaying();
        this.winAnimation();
    }
}

Puzzle.prototype.placeTiles = function() {
    var cells = $$('div.cell');
    var col = 0;
    var row = 0;

    for (var i=0; i < cells.length - 1; i++) {
                                  
        var xoffset = row * -150;
        var yoffset = col * -150;            
        
        var tile_style = "background: transparent url(" + this.image_path + ") " + yoffset + "px " + xoffset + "px no-repeat;"
        cells[i].insert(new Element('div', {'class': 'tile', 'id': 'tile_' + i, 'style': tile_style}).observe('click', this.clickCell.bindAsEventListener(this)));   
                                             
        if (col >= this.GameBoardWidth - 1) {  
            row++;
            col=0;
        }
        else {
            col++;
        }     
    }
}

Puzzle.prototype.isMovable = function(el) {
    var src = el.ancestors().first().id.match(/col(\d+)row(\d+)/);
    var dest = this.blank.id.match(/col(\d+)row(\d+)/);

    if (src) {
        var src_col = parseInt(src[1]);
        var src_row = parseInt(src[2]);
    }
    else {
        return false;
    }

    if (dest) {
        var dest_col = parseInt(dest[1]);
        var dest_row = parseInt(dest[2]);
    }
    else {
        return false;
    }

    if (src_col == dest_col && src_row == dest_row) {
        return false;
    }

    if (src_col+1 == dest_col && src_row == dest_row) {
        return true;
    }

    if (src_col-1 == dest_col && src_row == dest_row) {
        return true;
    }

    if (src_col == dest_col && src_row+1 == dest_row) {
        return true;
    }

    if (src_col == dest_col && src_row-1 == dest_row) {
        return true;
    }

    return false;
}

Puzzle.prototype.moveTile = function(el) {
    // make sure that we have a tile and that is is movable.
    if (el && el.classNames().grep(/tile/).length > 0 && this.isMovable(el)) {
        var new_blank = el.ancestors().first();
        this.blank.insert(el);
        this.blank = new_blank;
        this.move_count++;
    }

    if (this.play_started) {
        $('move_count').update("Moves: " + this.move_count);
    }
}


Puzzle.prototype.createGameBoard = function(width, height) {
    this.GameBoardWidth = width;
    this.GameBoardHeight = height;

    for (var i=0; i < height; i++) {
        var row = new Element('div', {'class': 'row', 'id': 'row' + i});

        for (var j=0; j < width; j++) {
            var cell = new Element('div', {'class': 'cell', 'id': 'col' + j + 'row' + i});
            row.insert(cell);
        }
        $('game').insert(row);
    }
}

Puzzle.prototype.getTileAbove = function(cell) {
    var src = cell.id.match(/col(\d+)row(\d+)/);
    var col = parseInt(src[1])
    var row = parseInt(src[2])
    
    if (row-1 < 0) {
        return this.getTileBelow(cell);
    }
    return $("col" + col + "row" + (row-1)).firstDescendant();
}

Puzzle.prototype.getTileBelow = function(cell) {
    var src = cell.id.match(/col(\d+)row(\d+)/);
    var col = parseInt(src[1])
    var row = parseInt(src[2])
    
    if (row+1 > this.GameBoardHeight-1) {
        return this.getTileAbove(cell);
    }
    return $('col' + col + 'row' + (row+1)).firstDescendant();
}

Puzzle.prototype.getTileLeft = function(cell) {
    var src = cell.id.match(/col(\d+)row(\d+)/);
    var col = parseInt(src[1])
    var row = parseInt(src[2])
    
    if (col-1 < 0) {
        return this.getTileRight(cell);
    }
    return $('col' + (col-1) + 'row' + row).firstDescendant();
}

Puzzle.prototype.getTileRight = function(cell) {
    var src = cell.id.match(/col(\d+)row(\d+)/);
    var col = parseInt(src[1])
    var row = parseInt(src[2])
    
    if (col+1 > this.GameBoardWidth-1) {
        return this.getTileLeft(cell);
    }
    return $('col' + (col+1) + 'row' + row).firstDescendant();
}

Puzzle.prototype.isShuffled = function() {
    var cells = $$('div.cell');
    var mixed_count = 0;
    var not_mixed_count = 0;

    for (var i=0; i<cells.size();i++) {
        var tile = cells[i].firstDescendant();

        if (tile) {
            var match = tile.id.match(/tile_(\d+)/)
            if (match && parseInt(match[1]) == i) {
                not_mixed_count++;
            }
            else {
                mixed_count++;
            }
        }
    }

    //if ((not_mixed_count * 10) < mixed_count)  {
    if (not_mixed_count == 0) {
        return true;
    }
    return false;
}

Puzzle.prototype.shuffleBoard = function(count) {
    var count = 0;

    while (!this.isShuffled()) {
        count++;
        this.randomMove();
    }
    $('shuffle_moves').update("Shuffle: " + count + " moves");
}

Puzzle.prototype.randomMove = function() {
    var direction = Math.round(Math.random() * 3)

    if (direction == 0) {
       this.moveTile(this.getTileAbove(this.blank));
    }
    else if (direction == 1) {
       this.moveTile(this.getTileBelow(this.blank));
    }
    else if (direction == 2) {
       this.moveTile(this.getTileLeft(this.blank));
    }
    else if (direction == 3) {
       this.moveTile(this.getTileRight(this.blank));
    }
}

Puzzle.prototype.isFinished = function() {
    var cells = $$('div.cell');

    for (var i=0; i<cells.size();i++) {
        var tile = cells[i].childElements().first()

        if (tile) {
            var match = tile.id.match(/tile_(\d+)/)
            if (match && parseInt(match[1]) != i) {
                return false;
            }
        }
    }
    return true;
} 

Puzzle.prototype.getImagePath = function() {
    this.image_count
    var random_number = 1 + Math.floor(Math.random() * this.image_count);
    return "images/puzzle" + random_number + ".jpg";
}

Puzzle.prototype.winAnimation = function() {
    function animateIt(id) {
        Effect.DropOut(id, {duration: Math.round(Math.random() * 4) + 1});
    }

    function playAgain() {
        if (confirm("Play again?")) {
            window.location.reload();    
        } 
    }

    $$('div.tile').each(function(item) {
        setTimeout(function() { animateIt(item.id) }, Math.random() * 4000 + 1000);
    });
    setTimeout(playAgain, 10000);
}


