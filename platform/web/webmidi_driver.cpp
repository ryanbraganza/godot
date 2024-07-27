#include "webmidi_driver.h"

#include <emscripten.h>

Error MIDIDriverWebMidi::open() {
	Error error = godot_js_webmidi_open_midi_inputs();
	if (error == ERR_UNAVAILABLE) {
		ERR_PRINT("Web MIDI is not supported on this browser");
	}
	return error;
}


void MIDIDriverWebMidi::close()  {

}

MIDIDriverWebMidi::~MIDIDriverWebMidi() {
	close();
}
