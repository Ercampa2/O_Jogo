// Classes
class Tile{
    constructor (coordX, coordY, ground) {
        this.coord = {
            'x': coordX,
            'y': coordY
        };
        this.ground = ground;
        this.variant = weightedRandom(gameSettings.tilesVariants.spawning[this.ground])
        this.variantAmount = gameSettings.tilesVariants.amount[this.variant];
        this.movementCost = gameSettings.tiles.movementCost[this.ground];
        this.building = "none";
        this.playerDiscovered = [];
        $(`#column-${this.coord.x}`).append(`<div class="tile" id="tile-${this.coord.x}-${this.coord.y}"><div class="tile tile-60"></div><div class="tile tile-300"></div></div>`);
    }
}

class Grid {
    constructor (width, height) {
        this.tilesGrid = [];
        for (let x = 1; x <= width; x++) {
            this.tilesGrid.push([]);
            if (x % 2 == 0) {
                var columnClass = "column-even";
            } else {
                var columnClass = "column-odd";
            }
            $('#grid').append(`<div class="${columnClass}" id="column-${x}"></div>`);
            for (let y = 1; y <= height; y++) {
                this.tilesGrid[x-1].push(weightedRandom(gameSettings.tiles.spawning));
                if (this.tilesGrid[x-1][y-1] != "grass" && this.tilesGrid[x-1][y-1] != "water") {
                    this.tilesGrid[x-1][y-1] += `_${rand(gameSettings.gridSettings.biomeSpreadMin, gameSettings.gridSettings.biomeSpreadMax)}`;
                }
            }
        }
        this.createGrid();
        this.createRivers();
        for (let x in this.tilesGrid) {
            x = parseInt(x);
            for (let y in this.tilesGrid[x]) {
                y = parseInt(y);
                let ground = this.tilesGrid[x][y]
                this.tilesGrid[x][y] = new Tile(x+1,y+1,ground);
            }
        }
    }
    createGrid () {
        for (let x in this.tilesGrid) {
            x = parseInt(x);
            for (let y in this.tilesGrid[x]){
                y = parseInt(y);
                if(this.tilesGrid[x][y].search('_') != -1) {       
                    let biomeArea = this.findArea([x,y],parseInt(this.tilesGrid[x][y].split('_')[1]));
                    for (let fi1 in biomeArea) {
                        for(let fo2 of biomeArea[fi1]){
                            if(this.tilesGrid[fo2[0] - 1] != undefined && fo2[1]-1 >=0 && fo2[1]-1 < gameSettings.gridSettings.height){
                                if (fi1 == biomeArea.length-1) {
                                    if(parseInt(weightedRandom({1 : gameSettings.gridSettings.lastBiomeChance, 0 : 1-gameSettings.gridSettings.lastBiomeChance}))){
                                        this.tilesGrid[fo2[0]-1][fo2[1]-1] = this.tilesGrid[x][y].split('_')[0];
                                    }
                                }else{
                                    this.tilesGrid[fo2[0]-1][fo2[1]-1] = this.tilesGrid[x][y].split('_')[0];
                                }
                            }
                        }
                    }
                    this.tilesGrid[x][y] = this.tilesGrid[x][y].split('_')[0];
                }
            }
        }
    }
    createRivers () {
        let waterPositions = [];
        for (let x in this.tilesGrid) {
            for (let y in this.tilesGrid[x]) {
                if (this.tilesGrid[x][y] == "water") {
                    waterPositions.push([parseInt(x), parseInt(y)]);
                }
            }
        }
        if (waterPositions.length % 2 == 1) {
            this.tilesGrid[waterPositions[waterPositions.length - 1][0]][waterPositions[waterPositions.length - 1][1]]= "grass";
            waterPositions.splice(waterPositions.length-1 , 1);
        }
        while (waterPositions.length > 1) {
            let pos1 = rand(0, waterPositions.length-1);
            let pos2 = rand(0, waterPositions.length-1);
            if(pos1 != pos2){
                let waterPath = findPathRandom([waterPositions[pos1], waterPositions[pos2]]);
                for (let fi1 in waterPath) {
                    if (this.tilesGrid[waterPath[fi1][0]][waterPath[fi1][1]] == "snow") {
                        this.tilesGrid[waterPath[fi1][0]][waterPath[fi1][1]] = "ice";
                    } else if (this.tilesGrid[waterPath[fi1][0]][waterPath[fi1][1]] != "sand") {
                        this.tilesGrid[waterPath[fi1][0]][waterPath[fi1][1]] = "water";
                    }
                }
                if(pos1 > pos2){
                    waterPositions.splice(pos1, 1);
                    waterPositions.splice(pos2, 1);
                }else{
                    waterPositions.splice(pos2, 1);
                    waterPositions.splice(pos1, 1);
                }
            }
        }
    }
    findArea (coord, range) {
        let response = [];
        response.push([[coord[0], coord[1]]]);
        for (let currentRange = 1; currentRange <= range; currentRange++) {
            response.push([])
            let ring = response.length-1;
            let top = [coord[0], coord[1]-currentRange];
            let bottom = [coord[0], coord[1]+currentRange];
            response[ring].push([top[0],top[1]]);
            response[ring].push([bottom[0],bottom[1]]);
            let y1 = 0;
            let y2 = 0;
            for (let x = 1; x <= currentRange; x++) {
                if ((coord[0] + x) % 2 == 1){
                    y1 += 1;
                } else {
                    y2 += 1;
                }
                response[ring].push([coord[0] + x, top[1] + y1]);
                response[ring].push([coord[0] - x,top[1] + y1]);
                response[ring].push([coord[0] + x,bottom[1] - y2]);
                response[ring].push([coord[0] - x,bottom[1] - y2]);
            }
            for (let y = 1; y < currentRange; y++){
                response[ring].push([coord[0] + currentRange, top[1] + y1 + y]);
                response[ring].push([coord[0] - currentRange, top[1] + y1 + y]);
            }
        }
        return response;
    }
    printTiles (x, y) {
        if(x > 0 && y > 0 && x < gameSettings.gridSettings.width && y < gameSettings.gridSettings.height ){

            let ground  = grid.tilesGrid[x-1][y-1].ground;
            let variant  = grid.tilesGrid[x-1][y-1].variant;
            
            $(`#tile-${x}-${y}`).addClass(`tile-${ground}`);
            $($(`#tile-${x}-${y}`).children()[0]).addClass(`tile-${ground}`);
            $($(`#tile-${x}-${y}`).children()[1]).addClass(`tile-${ground}`);
            if (variant != "default") {
                $(`#tile-${x}-${y}`).append(`<div class="variant-${variant}"></div>`);
            }
        }
    }
    fowRemover (coord) {
        let area = this.findArea(coord, gameSettings.gridSettings.fowVisibility);
        
        for (let fo1 of area) {
            for (let fo2 of fo1) {
                if (fo2[0] > 0 && fo2[1] > 0 && fo2[0] < gameSettings.gridSettings.width && fo2[1] < gameSettings.gridSettings.height) {
                    if (this.tilesGrid[fo2[0]][fo2[1]] != undefined) {
                        if (!(this.tilesGrid[fo2[0]][fo2[1]].playerDiscovered).includes("player1")) {
                            this.printTiles(fo2[0], fo2[1]);
                            this.tilesGrid[fo2[0]][fo2[1]].playerDiscovered.push("player1");
                        }else if ($(`#tile-${fo2[0]}-${fo2[1]}`).hasClass('fog')) {
                            $(`#tile-${fo2[0]}-${fo2[1]}`).removeClass('fog');
                            let variant  = grid.tilesGrid[fo2[0]-1][fo2[1]-1].variant;
                            let construction  = grid.tilesGrid[fo2[0]][fo2[1]].building.construction;
                            if (variant != "default") {
                                $(`#tile-${fo2[0]}-${fo2[1]}`).append(`<div class="variant-${variant}"></div>`);
                            }
                            $(`#tile-${fo2[0]}-${fo2[1]}`).append(`<div class="building-${construction}"></div>`);   
                        }
                    }
                }
            }
        }
    }
    fowReplacer (coords) {
        let player = this.findArea([coords[0].x,coords[0].y], gameSettings.gridSettings.fowVisibility)
        let newPlayer = this.findArea([coords[1].x,coords[1].y], gameSettings.gridSettings.fowVisibility)
        for (let fo1 of player) {
            for (let fo2 of fo1) {
                let overlap = false;
                for (let fo3 of newPlayer) {
                    for (let fo4 of fo3) {
                        if(fo2.join() == fo4.join()) {
                            overlap = true;
                        }
                    }
                }
                if (overlap == false) {
                    $(`#tile-${fo2[0]}-${fo2[1]}`).addClass('fog')
                    $($(`#tile-${fo2[0]}-${fo2[1]}`).children()[2]).remove();
                }
            }
        }
        
    }
}

class Player {
    constructor (coordX, coordY) {
        this.life = gameSettings.playerSettings.maxHealth;
        this.energy = gameSettings.playerSettings.maxEnergy;
        this.food = gameSettings.playerSettings.maxFood;
        this.water = gameSettings.playerSettings.maxWater;
        this.coord = {
            'x': coordX,
            'y': coordY
        };
        this.inventory = {};
        grid.fowRemover([this.coord.x, this.coord.y]);
        $(`#tile-${this.coord.x}-${this.coord.y}`).append('<div class="player" id="player"></div>');
        this.refreshInfo();
    }
    move (to) {
        let possibleMovement = false;
        let possibleMoves = grid.findArea([this.coord.x, this.coord.y], 1)[1];
        for (let fi1 in possibleMoves) {
            let value = possibleMoves[fi1];
            if ((value[0] == to.coord.x) && (value[1] == to.coord.y)) {
                possibleMovement = true;
                break;
            }
        }
        if (possibleMovement && this.energy >= to.movementCost){
            grid.fowReplacer([this.coord, to.coord]);
            this.energy -= to.movementCost;
            this.coord = to.coord;
            $('#player').remove();
            $(`#tile-${this.coord.x}-${this.coord.y}`).append('<div class="player" id="player"></div>');
            grid.fowRemover([this.coord.x, this.coord.y]);
        }
        
        this.refreshInfo()
    }
    collect () {
        if (grid.tilesGrid[this.coord.x - 1][this.coord.y - 1].variant != 'default') {
            let variant = grid.tilesGrid[this.coord.x - 1][this.coord.y - 1].variant;
            let tool = "default";

            for (let fi1 in gameSettings.tilesVariants.tools) {
                if (gameSettings.tilesVariants.tools[fi1].includes(variant)) {
                    if (this.hasItem(fi1, 1)) {
                        tool = fi1;
                    }
                }
            }
            if (gameSettings.tilesVariants.toolOnly.includes(variant) && tool == "default") {
                return
            }
            if(this.energy >= gameSettings.tilesVariants.collectionCost[variant][tool]){
                grid.tilesGrid[this.coord.x - 1][this.coord.y - 1].variantAmount -=1;
                this.energy -= gameSettings.tilesVariants.collectionCost[variant][tool];
            
                for (let fi1 in gameSettings.tilesVariants.drops.rate[variant]) {
                    let chance = parseFloat(gameSettings.tilesVariants.drops.rate[variant][fi1]);
                    let item = fi1;
                    if (parseInt(weightedRandom({1: chance, 0: (1-chance)}))) {
                        if (gameSettings.tilesVariants.drops.amount[item][tool] == undefined) {
                            this.addItem(item, gameSettings.tilesVariants.drops.amount[item]["default"]);
                        } else {
                            this.addItem(item, gameSettings.tilesVariants.drops.amount[item][tool]);
                        }
                    }
                }
                if (grid.tilesGrid[this.coord.x - 1][this.coord.y - 1].variantAmount == 0) {
                    $(`#tile-${this.coord.x}-${this.coord.y}`).find(`.variant-${grid.tilesGrid[this.coord.x - 1][this.coord.y - 1].variant}`).remove();
                    grid.tilesGrid[this.coord.x - 1][this.coord.y - 1].variant = 'default';
                }
            }
            
            this.refreshInfo();
        }
    }
    addItem (item, amount) {
        if (this.inventory[item] == undefined) {
            this.inventory[item] = new Item(item, amount);
        } else {
            this.inventory[item].amount += amount;
        }
    }
    refreshInfo () {
        let stringInventory = "";
        for (let fi1 in this.inventory) {
            let element = this.inventory[fi1];
            if(element.amount > 0){
                stringInventory += `${element.name}: x${element.amount} <br><br>`;
            }           
        }
        $("#inventory").html(stringInventory);
        let stringStatuses = `💓: ${this.life} - 🔋: ${this.energy} - 🍞: ${this.food} - 🍼:${this.water} - Round: ${game.round}`;
        $("#statuses").html(stringStatuses);
    }
    craft (item, amount) {
        let recipe = gameSettings.items.recipes[item];
        if (recipe != undefined) {
            if (!(gameSettings.items.craftableOnce.includes(item) && this.hasItem(item,1))) {
                if (this.energy >= recipe.energyCost) {
                    let hasItems = true;
                    for (let fi1 in recipe.items) {
                        if (!this.hasItem(fi1, (recipe.items[fi1]*amount))) {
                            hasItems = false;
                        }
                    }
                    if (hasItems) {
                        this.energy -= recipe.energyCost;
                        for (let fi1 in recipe.items) {
                            this.addItem(fi1, ( (recipe.items[fi1]*amount)*(-1) ));
                        }
                        this.addItem(item, amount);
                        this.refreshInfo();
                        this.craftInterface();
                    }
                }
            }
        }
    }
    hasItem (item, amount) { return (this.inventory[item] != undefined && this.inventory[item].amount >= amount) }
    craftInterface () {
        $("#craftBox").html('');
        $($(".craftingInterfaceModal")[0]).css("z-index","4");
        $("#craftBox").css({'transform':'scale(1)','opacity': '1'});
        for (let fi1 in gameSettings.items.recipes){
            let recipe = gameSettings.items.recipes[fi1];
            if (!(gameSettings.items.craftableOnce.includes(fi1) && this.hasItem(fi1,1))) {
                if (this.energy >= recipe.energyCost) {
                    let hasItems = true;

                    for (let fi2 in recipe.items) {
                        if (!this.hasItem(fi2, (recipe.items[fi2]))) {
                            hasItems = false;
                        }
                    }
                    if (hasItems) {
                        let itemButton = `<div class='itemCraftButton' onclick="player1.craft('${fi1}', 1)">${fi1}</div>`;
                        $("#craftBox").append(itemButton);
                    } else {
                        let itemButton = `<div class='itemCraftButton disabled'>${fi1}</div>`;
                        $("#craftBox").append(itemButton);
                    }
                }else{
                    let itemButton = `<div class='itemCraftButton disabled'>${fi1}</div>`;
                        $("#craftBox").append(itemButton);
                }
            }
        }
    }
    build (construction) {
        if (gameSettings.buildings[construction] != undefined) {
            let buildingInfo = gameSettings.buildings[construction];
            if (this.energy >= buildingInfo.energyCost && (this.hasItem(buildingInfo.tool, 1) || buildingInfo.tool == "default")) {
                let hasItems = true;
                for (let item in buildingInfo.items) {
                    if (!this.hasItem(item, buildingInfo.items[item])) {
                        hasItems = false;
                    }
                }
                if (hasItems) {
                    grid.tilesGrid[this.coord.x][this.coord.y].building = new Building([this.coord.x, this.coord.y], construction);
                }
            }
        }
    }
}

class Item {
    constructor (itemName, itemAmount) {
        this.name = itemName;
        this.amount = itemAmount;
    }
}

class Building {
    constructor (coord, construction) {
        this.construction = construction;
        this.interfaceShowing = false;
        this.inventory = [];
        this.coord = {
            'x': coord[0],
            'y':  coord[1]
        }
        $(`#tile-${this.coord.x}-${this.coord.y}`).append('<div class="building-campfire"></div>')
    }
    interaction () {
        switch (this.construction) {
            case "campfire":
                if (this.interfaceShowing) {
                    $("#modal-campfire").css({"opacity" : "0", "transform": "scale(.8)", "pointer-events": "none"});
                } else {
                    $("#modal-campfire").css({"opacity" : "1", "transform": "scale(1)", "pointer-events": "all"});
                }
            break;
            case "furnace":
                
            break;
            case "tower":
                
            break;
            case "fishingNet":
                
            break;
            default:
                console.log("There is no interaction");
                break;
        }
    }
}

// Variable Creation
var grid;
var player1;
var gameSettings;
var game = {};
//Game Logic
$.getJSON('js/gameSettings.json', async json => {
    gameSettings = json;
    
    game = {
        round: 1,
        nextRound() {
            player1.energy = gameSettings.playerSettings.maxEnergy;
            this.round += 1;
            player1.refreshInfo();
        }
    }
    
    grid = new Grid(gameSettings.gridSettings.width, gameSettings.gridSettings.height);

    $(document).keyup((e)=>{
        switch (e.key) {
            case 'c':
                player1.collect();
                break;
            case 'n':
                game.nextRound();
                break;
            case 'b':
                player1.craftInterface(); 
                break;
            case "Escape":
                if ($(".craftingInterfaceModal").css('z-index') != "-1") {
                    $("#craftBox").css({'transform':'scale(.8)','opacity': '0'});
                    setTimeout(() => {
                        $($(".craftingInterfaceModal")[0]).css("z-index","-1");
                    }, 300);
                }
                break;
        }
    });

    $(".tile").mouseup(function(event){
        if (event.which == 1) {
            if (event.currentTarget.id != '') {
                let x = parseInt(event.currentTarget.id.split('-')[1])-1;
                let y = parseInt(event.currentTarget.id.split('-')[2])-1;
                if (event.shiftKey) {
                    // console.log(`${x} - ${y}`);
                    // findArea([x+1,y+1], 4);
                    // markTile([x+1,y+1]);
                } else {
                    player1.move(grid.tilesGrid[x][y]);
                }
            }
        }
    });
    
    $(".craftingInterfaceModal").mouseup((event)=>{
        if($(event.target).hasClass('craftingInterfaceModal')){
            $("#craftBox").css({'transform':'scale(.8)','opacity': '0'});
            setTimeout(() => {
                $($(".craftingInterfaceModal")[0]).css("z-index","-1");
            }, 300);
        }
    })

    player1 = new Player(10, 4);
    
});

function rand(min, max) {
    return Math.floor(Math.random() * ((max+1) - min) + min);
}

function weightedRandom(prob) {
    let i, sum=0, r=Math.random();
    for (i in prob) {
      sum += prob[i];
      if (r <= sum) return i;
    }
}

function findPathRandom(coords) {   
    let response = [];
    let direction = [1,1];
    if (coords[0][0] > coords[1][0]) {
        direction[0] *= -1;
    }
    if (coords[0][1] > coords[1][1]) {
        direction[1] *= -1;
    }
    let xVariation = Math.abs(coords[0][0] - coords[1][0]);
    let yVariation = Math.abs(coords[0][1] - coords[1][1]);
    if (yVariation == 0) {
        for (let x = xVariation; x >=0; x--) {
            response.push([coords[0][0] + x*direction[0],coords[0][1]]);
        }   
    } else if (xVariation == 0) {
        for (let y = yVariation; y >=0; y--) {
            response.push([coords[1][0], coords[0][1] + y*direction[1]]);
        }
    } else {
        let currentCoord = [coords[0][0], coords[0][1]];
        response.push([currentCoord[0], currentCoord[1]]);
        while (true) {
            xVariation = Math.abs(currentCoord[0] - coords[1][0]);
            yVariation = Math.abs(currentCoord[1] - coords[1][1]);
            pathSum = xVariation + yVariation;
            xRatio = xVariation / pathSum;
            yRatio = yVariation / pathSum;
            if (parseInt(weightedRandom({1 : xRatio, 0 : yRatio}))) {
                currentCoord[0] += direction[0];
            } else {
                currentCoord[1] += direction[1];
            }
            response.push([currentCoord[0], currentCoord[1]]);
            if (currentCoord[0] == coords[1][0] && currentCoord[1] == coords[1][1] ) { break }
        }
    }
    return response
}

function markTiles(coords) {
    for (let fi1 in coords) {
        $(`#tile-${coords[fi1][0]}-${coords[fi1][1]}`).css("opacity", ".5");
    }
}
