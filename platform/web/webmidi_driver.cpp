#include "webmidi_driver.h"

#include <emscripten.h>

MIDIDriverWebMidi *MIDIDriverWebMidi::get_singleton() {
	return static_cast<MIDIDriverWebMidi *>(MIDIDriver::get_singleton());
}

Error MIDIDriverWebMidi::open() {
	Error error = godot_js_webmidi_open_midi_inputs(&MIDIDriverWebMidi::set_input_names_callback);
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

void MIDIDriverWebMidi::set_input_names_callback(int p_size, const char **p_input_names) {
	Vector<String> input_names;
	for (int i = 0; i < p_size; i++) {
		input_names.append(String::utf8(p_input_names[i]));
	}
#ifdef PROXY_TO_PTHREAD_ENABLED
	if (!Thread::is_main_thread()) {
		callable_mp_static(MIDIDriverWebMidi::_set_input_names_callback).call_deferred(input_names);
		return;
	}
#endif

	_set_input_names_callback(input_names);
}

void MIDIDriverWebMidi::_set_input_names_callback(const Vector<String> &p_input_names) {
	get_singleton()->connected_input_names.clear();
    for (int i = 0; i < p_input_names.size(); i++) {
		get_singleton()->connected_input_names.push_back(p_input_names[i]);
	}
}
