
angular.module('KlappyBird', [])
	.service('ScoreService', ['$http', function($http){
		var getUrl = 'http://localhost/devision/webapi/public/data',
			postUrl= 'http://localhost/devision/webapi/public/highscore';

		return {
			getData: function function_name(argument) {
				return $http.get(getUrl);
			},
			upload: function (name, score) {
				return $http.post(postUrl, {name: name, score: score}, {type: 'json'});
			}
		};
	}])
	.controller('MainController', ['$scope', 'ScoreService', function ($scope, scoreService) {

		var stage,
			crashed,
			bm_bird_step,
			bm_bird_step_base,
			img_bird,
			sh_topRect,
			sh_botRect,
			bm_bird,
			t_scoreText,
			score;


		function init() {
			stage = new createjs.Stage("canvas");

			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener('tick', tick);
			createjs.Ticker.setPaused(true);
			scoreOffset = 0;

			crashed = false;

			bm_bird_step = 1;
			bm_bird_step_base = 1;

			img_bird = new Image();
			img_bird.src = 'img/bird.png';
			img_bird.onload = function (e) {
				stage.update(e);
			};

			sh_topRect = new createjs.Shape();
			sh_botRect = new createjs.Shape();
			bm_bird	   = new createjs.Bitmap(img_bird);

			sh_topRect.graphics.beginFill("green").drawRect(0, 0, 20, 60);
			sh_botRect.graphics.beginFill("green").drawRect(0, 120, 20, 99);

			// bitamp, y u do dis
			bm_bird.scaleX = 0.25;
			bm_bird.scaleY = 0.4;
			bm_bird.y = stage.canvas.height/2-10;
			bm_bird.x = 20;

			t_scoreText = new createjs.Text("Score: 0", "14px monospace", "#000");
			t_scoreText.lineHeight = 15;
			t_scoreText.textBaseline = "top";
			t_scoreText.x = stage.canvas.width - t_scoreText.width;
			t_scoreText.y = stage.canvas.height-t_scoreText.lineHeight*3-10;

			stage.addChild(sh_topRect);
			stage.addChild(sh_botRect);
			stage.addChild(bm_bird);
			stage.addChild(t_scoreText);
			stage.update();
		}

		function tick(event) {
			if (!createjs.Ticker.getPaused()) {

				// bird movement
				bm_bird.y += bm_bird_step;
				if (bm_bird_step < bm_bird_step_base) {
					bm_bird_step += 0.5;
				}

				// obstacle movement
				sh_topRect.x -= 2;
				sh_botRect.x -= 2;
				if (sh_topRect.x < -1) {
					sh_topRect.x = stage.canvas.width;
					sh_botRect.x = stage.canvas.width;
				}

				// hit detection
				if (bm_bird.y > stage.canvas.height || bm_bird.y < 0) {
					onCrash();
				}
				var pt_bird_top = bm_bird.localToLocal(0,0, sh_topRect);
				var pt_bird_bot = bm_bird.localToLocal(0,0, sh_botRect);
				if (sh_topRect.hitTest(pt_bird_top.x, pt_bird_top.y) || sh_botRect.hitTest(pt_bird_bot.x, pt_bird_bot.y)) {
					onCrash();
				}

				// update and redraw score
				score = getScore();
				t_scoreText.text = "Score: "+ score;

				stage.update(event); // important!!
			}
		}

		function getScore() {
			var time = createjs.Ticker.getTime(true);
			score = parseInt(parseInt(time)/100);

			return score;
		}

		function onClick(e) {
			bm_bird_step -= 6;
			if (createjs.Ticker.getPaused() && !crashed) {
				createjs.Ticker.setPaused(false);
			}
			stage.update(e);
		}

		function onReset() {
			crashed = false;
			createjs.Ticker.setPaused(true);
			sh_topRect.x = 0;
			sh_botRect.x = 0;
			bm_bird.y = stage.canvas.height/2-10;
			bm_bird_step = bm_bird_step_base;
			t_scoreText.text = "Score: 0";
			stage.canvas.style= "";
			stage.update();
		}

		function onCrash() {
			stage.canvas.style= "background-color: gray";
			$('#score-modal').modal('show');
			createjs.Ticker.setPaused(true);
			crashed = true;
			// alert('current score: '+getScore());
			$scope.$apply(function () {
				$scope.score = getScore();
			});
		}

		$scope.upload = function () {
			scoreService.upload($scope.playerName, $scope.score).then(function () {
				scoreService.getData().then(function (scoresResult) {
					$scope.scores = scoresResult.data;
				});
			});

			$('#score-modal').modal('hide');
		}

		init();

		$scope.score = 0;
		$scope.scores = [];
		$scope.playerName = "UNKNOWN";
		scoreService.getData().then(function (scoresResult) {
			$scope.scores = scoresResult.data;
		});
		
		stage.addEventListener('stagemousedown', onClick);

		$('#score-modal').on('hide.bs.modal', function (e) {
			onReset();
		});
	}]);

