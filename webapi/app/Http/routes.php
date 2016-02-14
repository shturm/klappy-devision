<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

use App\Score;
use Illuminate\Http\Request;
// use DB;
// $users = DB::table('users')->get();


Route::get('/', function () {
    return view('welcome');
});

Route::get('/data', function () {
	return DB::table('scores')
		->orderBy('score', 'desc')
		->take(4)
		->get();
});

Route::post('/highscore', function (Request $r) {
	$score = new Score();
	$score->name = $r->input('name');
	$score->score = $r->input('score');
	$score->save();
});
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/

Route::group(['middleware' => ['web']], function () {
    //
});
