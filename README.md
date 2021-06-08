# Maze

### Easy Maze

</br>

<img src="/media/images/easymaze.png">

</br>

This Maze is an <b>Easy Maze</b>. Finding easy mazes is only possible below level 10.
* The <b>Red Circle</b> is the <b>Player</b>.
* The <b>Pink Square</b> is the <b>Princess</b>. The player has to rescue the princess to finish the maze.
* The <b>Black Sticks</b> are <b>Walls</b>. The player can not pass through a wall.
* The <b>Black Lock</b> is a <b>Locked Door</b>. The player can not pass through a locked door.
* The <b>Yellow Rhombus</b> is a <b>Key</b>. The player has to reach one key to unlock one door.</br>A new key is generated when the player unlocks a door.

</br>

<b>Tip:</b> Following the doors is the best way to find the princess.</br>

---

### Stairs Maze

</br>

|<img src="/media/images/stairsmaze_floor0.png"/>|<img src="/media/images/stairsmaze_floor1.png"/>|<img src="/media/images/stairsmaze_floor2.png"/>|
|:------------:|:-------------:|:-----------:|
| Floor 0 | Floor 1 | Floor 2 |

</br>

This Maze is a <b>Stairs Maze</b>. A stairs maze is a 3D Maze where the player can find doors and keys.</br>
The player can unlock this type of maze by reaching level 10.
* The <b>Yellow Squares</b> are <b>Up Stairs</b>. The player can access higher floors by using up stairs.
* The <b>Blue Squares</b> are <b>Down Stairs</b>. The player can access lower floors by using down stairs.
* The <b>Green Squares</b> are <b>Bidirectional Stairs</b>. The player can access lower and higher floors by using bidirectional stairs.

</br>

Accessing a stair do not move the player.

---

### Springs Maze

</br>

<img src="/media/images/springsmaze.png">

</br>

This Maze is a <b>Springs Maze</b>. There are doors and keys in springs mazes.</br>
The player can unlock this type of maze by reaching level 10.
* The <b>Orange Squares</b> are <b>Springs</b>. A spring is linked to another spring (and only one).
* The <b>Orange Square With Red Borders</b> is the <b>Linked Spring</b> of the spring where the player is on.</br>
When the player uses a spring, the player is sent to its linked spring. 

---

### Ice Maze

</br>

|<img src="/media/images/icemaze_skating.gif"/>|
|:------------:|
| The player skates until the next white Square |

</br>

This Maze is an <b>Ice Maze</b>. There are no doors and keys in ice mazes.</br>
The player can unlock this type of maze by reaching level 10.</br>
The <b>Cyan Squares</b> are <b>Ice</b>. When the player is on it, the player skates in the same direction until the next white square.</br>

---

### Arrows Maze

</br>

|<img src="/media/images/arrowsmaze.png">|<img src="/media/images/arrowsmaze_reversed.png">|
|:------------:|:------------:|
| Before the player used interuptor | After the player used interuptor |

</br>

This Maze is an <b>Arrows Maze</b>. There are no doors and keys in arrows mazes.</br>
The player can unlock this type of maze by reaching level 10.</br>
The <b>Grey Squares With Colored Arrows</b> are <b>Arrows</b>. When the player passes over it, the player is displaced in the arrow direction.</br>
The player has an interuptor to reverse arrow directions when used (with an unlimited usage).</br>

---

### Portals Maze

</br>

|<img src="/media/images/portalsmaze_year0.png"/>|<img src="/media/images/portalsmaze_year2.png"/>|<img src="/media/images/portalsmaze_year5.png"/>|
|:------------:|:-------------:|:-----------:|
| Year 0 | Year 2 | Year 5 |

</br>

This Maze is a <b>Portals Maze</b>. A portals maze is a 3D Maze where the player can not find doors and keys.</br>
The player can unlock this type of maze by reaching level 10.
* The <b>Red Spirals</b> are <b>Future Portals</b>. The player can access the nearest next year by using future portals.
* The <b>Blue Spirals</b> are <b>Past Portals</b>. The player can access the nearest past year by using past portals.
* The <b>Purple Spirals</b> are <b>Bidirectional Portals</b>. The player can access nearest next and past years by using bidirectional portals.

</br>

Each year 12 nodes are added to a maze but portals do not give access to each year of the maze.</br> 
For example in the maze shown above, years 1, 3 and 4 are unaccessible.</br> 
Passing through a portal does not move the player.

---

### Queens Maze

</br>

<img src="/media/images/queensmaze.png">

</br>

This Maze is a <b>Queens Maze</b>. There are doors and keys in queens mazes.</br>
The player can unlock this type of maze by reaching level 10.</br>
The <b>White Squares with Brown Corners</b> are <b>Queens</b>.</br>
When the player is over a queen, the player can be displaced on the nearest node in the direction of the brown corner.

---

### Controls</br></br>

#### General

<table>
  <tr>
    <td><b> ← </b></td>
    <td> Moves the player to the left </td>
  </tr>
  <tr>
    <td><b> → </b></td>
    <td> Moves the player to the right </td>
  </tr>
  <tr>
    <td><b> ↑ </b></td>
    <td> Moves the player to the top </td>
  </tr>
  <tr>
    <td><b> ↓ </b></td>
    <td> Moves the player to the down </td>
  </tr>
  <tr>
    <td> + </td>
    <td> Zoom In </td>
  </tr>
  <tr>
    <td> - </td>
    <td> Zoom Out </td>
  </tr>
  <tr>
    <td> Enter </td>
    <td> Enables/Disables smooth maze building animation</br>(disabling smooth animation builds big mazes faster) </td>
  </tr>
</table>

</br>

#### Stairs Maze Specific

<table>
  <tr>
    <td> Page Up </td>
    <td> Moves the player to the higher floor if the player is on up or bidirectional stairs </td>
  </tr>
  <tr>
    <td> Page Down </td>
    <td> Moves the player to the lower floor if the player is on down or bidirectional stairs </td>
  </tr>
  <tr>
    <td> Shift </td>
    <td> Moves the view to the higher floor </td>
  </tr>
  <tr>
    <td> Control </td>
    <td> Moves the view to the lower floor </td>
  </tr>
</table>

</br>

#### Springs Maze Specific

<table>
  <tr>
    <td> Space </td>
    <td> Moves the player to the linked spring where the player is on </td>
  </tr>
  <tr>
    <td> Mouse </td>
    <td> Highlights a spring and its linked spring </td>
  </tr>
</table>

</br>

#### Arrows Maze Specific

<table>
  <tr>
    <td> Space </td>
    <td> Reverses arrows direction </td>
  </tr>
</table>

</br>

#### Portals Maze Specific

<table>
  <tr>
    <td> = </td>
    <td> Moves the player to the nearest next year if the player is on future or bidirectional portal </td>
  </tr>
  <tr>
    <td> Backspace </td>
    <td> Moves the player to the nearest past year if the player is on past or bidirectional portal </td>
  </tr>
  <tr>
    <td> F </td>
    <td> Moves the view to the nearest next year </td>
  </tr>
  <tr>
    <td> P </td>
    <td> Moves the view to the nearest past year </td>
  </tr>
</table>

</br>

#### Queens Maze Specific

<table>
  <tr>
    <td> 1 </td>
    <td> Moves the player to the bottom-left if the movement is allowed by the queen </td>
  </tr>
  <tr>
    <td> 3 </td>
    <td> Moves the player to the bottom-right if the movement is allowed by the queen </td>
  </tr>
  <tr>
    <td> 7 </td>
    <td> Moves the player to the top-left if the movement is allowed by the queen </td>
  </tr>
  <tr>
    <td> 9 </td>
    <td> Moves the player to the top-right if the movement is allowed by the queen </td>
  </tr>
</table>

---

### Solution

Mazes has always a solution (and only one). The player can find it or type the password to see it.

---

### Configuration

To play game, type this in your terminal when you are in the <b>./Maze</b> repository:</br>
```sh
tsc
firefox index.html
```
