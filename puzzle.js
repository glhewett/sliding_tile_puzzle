// Puzzle constructor
function Puzzle () {
    this.initialize();
}

Puzzle.prototype.initialize = function() {
    this.createGameBoard(4,4);
    this.placeTiles();
    this.blank = this.findBlank();
    this.shuffleBoard(10000);
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

Puzzle.prototype.clickCell = function(ev) {
    this.moveTile(Event.element(ev))

    if (this.isFinished()) {
        alert("You won!");
    }
}

Puzzle.prototype.placeTiles = function() {
    var cells = $$('div.cell');

    for (var i=0; i < cells.length - 1; i++) {
        cells[i].insert(new Element('div', {'class': 'tile', 'id': 'tile_' + i}).observe('click', this.clickCell.bindAsEventListener(this)));        
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
    if (el.classNames().grep(/tile/).length > 0 && this.isMovable(el)) {
        var new_blank = el.ancestors().first();
        this.blank.insert(el);
        this.blank = new_blank;
    }
}


Puzzle.prototype.createGameBoard = function(width, height) {
    for (var i=0; i < height; i++) {
        var row = new Element('div', {'class': 'row', 'id': 'row' + i});

        for (var j=0; j < width; j++) {
            var cell = new Element('div', {'class': 'cell', 'id': 'col' + j + 'row' + i});
            row.insert(cell);
        }
        $('game').insert(row);
    }
}

Puzzle.prototype.shuffleBoard = function(count) {
    var tiles = $$('div.tile');
    
    for (var i=0;i<count;i++) {
        var index = (Math.round(Math.random() * 100) % tiles.size());
        this.moveTile(tiles[index]);
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

new Puzzle();

