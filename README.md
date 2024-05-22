# Liberty - a multi-modal communications-board

Liberty is a multi-modal communications board that allows carers to set up gesture-based interaction according to the user's range of abilities. This includes gesture controllers such as Leap motion and Myo, accessibility switches as well as keyboard interaction.

This project was developed at the University of Malta (HCI Lab) by Vladislav Kalashnikov, Kurt Camilleri, Kieran Cauchi and Ignacio Arias under the supervision of Chris Porter.

## Installation

You must have NodeJS installed to run the application in the development environment.

```
1 Open up the command line in the solution folder
2 Run "npm install". This will install all the required dependencies.
3 To start the application, run "npm run dev" from the command line.
4 You can create your own vocabulary or import the provided demo board.
5 To build the executable file for your chosen platform, run the following command: `npm run dist`
```

##Dependencies

1. Ultraleap Tracking Software (Gemini) 5.0.0 (last version that includes LeapJS + WebSocket server) - https://developer.leapmotion.com/releases

## Usage

```
1 Run liberty Setup 1.0.0.exe
2 [Optional] - You may import "demoboard.json" into the application. Note that the board will not be available automatically the next time you use the application unless you change the configurations and set the provided vocabulary as your default vocabulary.
3 To use LEAP Motion you must own a LEAP Motion Controller. To be able to use LEAP Motion with this application please install the LEAP Motion Orion SDK v3.2.1 from https://developer.leapmotion.com/releases/leap-motion-orion-321 
4 To be able to use MYO armband with this application please install the MYO Connect from https://support.getmyo.com/hc/en-us/articles/360018409792 
```

## People

- [Vladislav Kalashnikov](mailto:vladislav.kalashnikov.17@um.edu.mt)
- [Kurt Camilleri](mailto:kurt.camilleri.17@um.edu.mt)
- [Kieran Cauchi](mailto:kieran.cauchi.17@um.edu.mt)
- [Ignacio Arias](mailto:ignacio.arias.18@um.edu.mt)
- [Chris Porter](https://www.um.edu.mt/profile/chrisporter)

Expert advise provided by:
- [Sharon Borg](mailto:sharon.borg@ilearn.edu.mt) - Access to Communication & Technology Unit (ACTU)
- [May Agius](mailto:may.agius.2@ilearn.edu.mt) - Access to Communication & Technology Unit (ACTU)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GPL3](https://www.gnu.org/licenses/gpl-3.0.en.html)
