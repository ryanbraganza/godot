#include "webmidi_driver.h"

#include <emscripten.h>

Error MIDIDriverWebMidi::open() {
	return OK;
}


void MIDIDriverWebMidi::close()  {

}

MIDIDriverWebMidi::~MIDIDriverWebMidi() {
	close();
}
