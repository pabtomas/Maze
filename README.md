# Maze

|<img src="/media/stairsmaze_floor1.png"/>|<img src="/media/stairsmaze_floor2.png"/>|<img src="/media/stairsmaze_floor3.png"/>|
|:------------:|:-------------:|:-----------:|
|<b>FLOOR 1</b>|<b>FLOOR 2</b>|<b>FLOOR 3</b>|

This Maze is a <i>Stairs Maze</i>. A <i>Stairs Maze</i> is a 3D Maze.</br></br>
The <i>Red Circle</i> is the <i>Player</i>. Press the arrows' keyboard to move him.</br>
The <i>Pink Square</i> is the <i>Princess</i>. The <i>Player</i> has to rescue her to finish the maze.</br>
The <i>Black Areas</i> are <i>Walls</i> . The <i>White</i> and <i>Colored Squares</i> are the areas where the <i>Player</i> can move.</br>
The <i>Black Locks</i> are <i>Locked Doors</i>. The <i>Yellow Rhombus</i> is a <i>Key</i>.</br>
A new <i>Key</i> is generated when the <i>Player</i> unlocks a <i>Door</i></br>
The <i>Player</i> can't pass through a <i>Locked Door</i>. The <i>Player</i> has to reach one <i>Key</i> to unlock one <i>Door</i>.</br>
The <i>Blue Squares</i> are <i>Down Stairs</i>. The <i>Player</i> can use it with the <i>PageDown</i> key.</br>
The <i>Yellow Squares</i> are <i>Up Stairs</i>. The <i>Player</i> can use it with the <i>PageUp</i> key.</br>
The <i>Green Squares</i> are <i>Up</i> and <i>Down Stairs</i>.</br></br>

<i>Tips:</i></br>
Following the <i>Doors</i> is the best way to find the <i>Princess</i></br>
Press the <i>Shift</i> and the <i>Control</i> keys to change the maze's floor.</br>

<img src="/media/springsmaze.png">

This Maze is a <i>Springs Maze</i>.</br></br>
The <i>Orange Squares</i> are <i>Springs</i>. A <i>Spring</i> is linked to another <i>Spring</i> (and only one).</br>
The <i>Orange Square</i> with <i>Red Borders</i> is the <i>Linked Spring</i> of the <i>Spring</i> where the <i>Player</i> is.</br>
When the <i>Player</i> uses a <i>Spring</i>, he is sent to its <i>Linked Spring</i>. The <i>Player</i> can use a <i>Spring</i> with the <i>Space</i> bar.</br></br>

<i>Tips:</i></br>
Here, following the <i>Doors</i> is also the best way to find the <i>Princess</i></br>
If the mouse is over a <i>Spring</i>, the maze will highlight the <i>Spring</i> and its <i>Linked Spring</i>.</br>

|<img src="/media/icemaze1.gif"/>|<img src="/media/icemaze2.gif"/>|
|:------------:|:-------------:|
|The <i>Player</i> skates until the next <i>White Square</i>|The <i>Player</i> bounces on <i>Walls</i> or <i>Maze Limits</i>|

This Maze is an <i>Ice Maze</i>. There aren't <i>Doors</i> and <i>Keys</i> in <i>Ice Mazes</i>.</br></br>
The <i>Cyan Squares</i> are <i>Ice</i>. When the <i>Player</i> is on it, he skates in the same direction until the next <i>White Square</i>.</br>
If the <i>Player</i> meets a <i>Wall</i> or a <i>Maze Limit</i> before a <i>White Square</i>, he bounces on it.</br>

<img src="/media/arrowsmaze.png">

This Maze is an <i>Arrows Maze</i>. There aren't <i>Doors</i> and <i>Keys</i> in <i>Arrows Mazes</i>.</br></br>
The <i>Navy Squares with Colored Arrows inside</i> are <i>Arrows</i>. When the <i>Player</i> is on it, he is displaced in the <i>Arrow's Direction</i>.</br>
Press the <i>Space</i> bar to reverse <i>Arrows' Directions</i>.</br></br>

<i>Tips:</i></br>
Press the <i>+</i> and the <i>-</i> keys to zoom in and zoom out.</br>
Press the <i>Enter</i> key to disable/enable smooth maze building animation. Disabling smooth animation builds big mazes faster.</br>
Maze has always a solution. Type the password to see it.</br></br>

To play game, type this in your terminal when you are in the <b>./Maze</b> repository:</br>
```sh
tsc
firefox index.html
```
