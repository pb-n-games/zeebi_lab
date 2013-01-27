Game = {
  // This defines our grid's size and the size of each of its tiles
  map_grid: {
    width:  12,
    height: 8,
    tile: {
      width:  64,
      height: 64
    }
  },

  background: 'url("assets/background.jpeg") no-repeat 0 0',

  assets: [
    'assets/t_env_bugB.png',
    'assets/t_env_fireB.png',
    'assets/t_env_waterB.png',
  ],

  state_machine: StateMachine.create({
    initial: 'loading',
    events: [
      { name: 'loaded',  from: ['loading', 'loaded'], to: 'loaded' },
      { name: 'run',     from: ['loaded', 'paused'],  to: 'running' },
      { name: 'reset',   from: ['running', 'paused'], to: 'loaded' },
      { name: 'reload',  from: ['loaded'],            to: 'loaded' },
      { name: 'loading', from: '*',                   to: 'loading' },
      { name: 'pause',   from: 'running',             to: 'paused' }
    ]
  }),

  // The total width of the game screen. Since our grid takes up the entire screen
  //  this is just the width of a tile times the width of the grid
  width: function() {
    return this.map_grid.width * this.map_grid.tile.width;
  },

  // The total height of the game screen. Since our grid takes up the entire screen
  //  this is just the height of a tile times the height of the grid
  height: function() {
    return this.map_grid.height * this.map_grid.tile.height;
  },

  // Initialize and start our game
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init(this.width(), this.height());
    Crafty.background(this.background);

    Game.current_level = 1;

    Controls.watchKeyPresses();

    Game.watchEvents();

    // Simply start the "Loading" scene to get things going
    Crafty.scene('Loading');
  },

  watchEvents: function() {
    Crafty.bind('startSimulation', function() {
      Game.runSimulation();
    });

    Crafty.bind('reloadLevel', function() {
      if (Game.state_machine.current == 'loaded') {
        Game.reloadLevel();
      } else {
        Crafty.trigger('resetSimulation');
        Game.resetSimulation();
      }
    });

    Crafty.bind('pauseSimulation', function() {
      Game.pauseSimulation();
    });

    Crafty.bind('placeTile', function(event_data) {
      // console.log('event_data', event_data);

      var tile_x = Math.floor(event_data.x / Game.map_grid.tile.width),
          tile_y = Math.floor(event_data.y / Game.map_grid.tile.height);

      Crafty.e(event_data.id).at(tile_x, tile_y);
    });
  },

  loadSprites: function() {
    _.each('bug fire water'.split(' '), function(unit) {
      var sprite_name = 'spr_' + unit
      var sprite_map_obj = {}
      sprite_map_obj[sprite_name] = [0, 0];
      Crafty.sprite(64, 'assets/t_env_' + unit + 'B.png', sprite_map_obj);
    });

    Crafty.sprite(64, 'assets/env_wallA.png', {
      spr_wall: [0, 0]
    });

    Crafty.sprite(64, 'assets/t_chr_yellowA_walk.png', {
      spr_goomba_yellow: [0, 1]
    });
  },

  loadAudio: function() {
    // Define our sounds and muic here for later use...

  },

  getLevel: function(level_id) {
    return _.find(Game.levels, function(level) {
      if (level.id == level_id) {
        return level;
      }
    }) || { data: null };
  },

  // Load the specified level, or load/reload the current level if no level
  //  is specified
  loadLevel: function(level) {
    // If no level was specified, default to loading/reloading the current level
    if (!level) {
      level = Game.current_level;
    }

    // Look up a level by its id
    if (!(level instanceof Object)) {
      level = Game.getLevel(level);
      level_data = level.data;
    }

    // Return if for whatever reason we have not located level data
    if (!level_data) {
      return;
    }

    Crafty.scene('Game');

    level_data.forEach(function(row, y) {
      // console.log(row, y);
      row.split('').forEach(function(col, x) {
        switch (col) {
          case 'G':
            Crafty.e('YellowGoomba').at(x, y);
            break;
          case 'W':
            Crafty.e('Wall').at(x, y);
            break;
          case 'E':
            Crafty.e('Exit').at(x, y);
            break;
          default:
            break;
        }
      })
    });

    // Init metadata for Goombas, etc.
    Crafty('Goomba').each(function() {
      this.startPosition = { x: this.at().x, y: this.at().y };
    });

    Game.current_level = level;

    console.log('Loaded level ' + level.id)
  },

  reloadLevel: function() {
    Game.state_machine.reload();
    console.log('Game [reloading level]');
    Game.loadLevel();
  },

  resetSimulation: function() {
    Game.state_machine.reset();
    console.log('Game [reseting simulation]');
  },

  runSimulation: function() {
    Game.state_machine.run();
    console.log('Game [running]');
  },

  pauseSimulation: function() {
    Game.state_machine.pause();
    console.log('Game [pausing]');
  }
}
Game.start = Game.start.bind(Game);

$text_css = { 'font-size': '24px', 'font-family': 'Arial', 'color': 'white', 'text-align': 'center' }