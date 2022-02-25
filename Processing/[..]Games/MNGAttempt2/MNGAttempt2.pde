

import processing.sound.*;

//class SoundFile {
//  String name;
//  PApplet pa;
//  SoundFile(PApplet pa_, String name_) {
//    pa = pa_;
//    name = name_;
//  }
//  void play() {
//    print("\nPlay: " + name);
//  }
//}


//--------------------------------------------------------------------------------


ArrayList<screen> screens = new ArrayList<screen>(); // Screen and mouse
PVector currentScreen = new PVector(0, 0);
PVector gotoScreen = new PVector(0, 0);
boolean mouseIsPressed = false;
PVector trueMouse = new PVector(0, 0);

boolean playing = false; // Settings
int difficulty = 0;

person gPersonSelected; // Game
ArrayList<person> gPeople;
gridSlot[][] gGrid;
PVector gGridPos = new PVector(200, 130);
PVector gGridSize = new PVector(7, 12);
PVector gGridSlotSize = new PVector(45, 45);
PVector gGridSpacing = new PVector(2, 2);
boolean gPaint = false;
float gMoney;
float gIncome;
time gTime;
int framesPerHour = 30;
String[][] gPossibleConditions = new String[][] {
  new String[] {"Team worker", "Solo study"}, 
  new String[] {"Groggy morning", "Earlyworm"}, 
  new String[] {"Tiresome", "Nightowl"}, 
  new String[] {"Sickly", "Immune"}, 
  new String[] {"Friendly", "Hateful"}, 
  new String[] {"Fast learner", "Slow learner"}, 
  new String[] {"Narcisist", "Charitable"}
};
illness[] gPossibleIllness = new illness[] {
  new illness("Flu", 2, 5), 
  new illness("Headache", 2, 5), 
  new illness("Stomach pain", 2, 7)
};

int[][] c = new int[][] {
/*0*/  new int[] {240}, // Background
/*1*/  new int[] {80}, // Arrow default / Slider circle
/*2*/  new int[] {100, 200, 100}, // Easy
/*3*/  new int[] {200, 150, 100}, // Medium
/*4*/  new int[] {200, 100, 100}, // Hard
/*5*/  new int[] {170, 190} // Slider background, from-to
};
String[][][] names;
mediaManager mdMng;


//--------------------------------------------------------------------------------


void setup() {
  size(800, 800);
  allSetup();
}


//--------------------------------------------------------------------------------


void draw() {
  allUpdate();
  allDraw();
}


//--------------------------------------------------------------------------------
