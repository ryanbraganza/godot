/**************************************************************************/
/*  library_godot_webmidi.js                                              */
/**************************************************************************/
/*                         This file is part of:                          */
/*                             GODOT ENGINE                               */
/*                        https://godotengine.org                         */
/**************************************************************************/
/* Copyright (c) 2014-present Godot Engine contributors (see AUTHORS.md). */
/* Copyright (c) 2007-2014 Juan Linietsky, Ariel Manzur.                  */
/*                                                                        */
/* Permission is hereby granted, free of charge, to any person obtaining  */
/* a copy of this software and associated documentation files (the        */
/* "Software"), to deal in the Software without restriction, including    */
/* without limitation the rights to use, copy, modify, merge, publish,    */
/* distribute, sublicense, and/or sell copies of the Software, and to     */
/* permit persons to whom the Software is furnished to do so, subject to  */
/* the following conditions:                                              */
/*                                                                        */
/* The above copyright notice and this permission notice shall be         */
/* included in all copies or substantial portions of the Software.        */
/*                                                                        */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,        */
/* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF     */
/* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. */
/* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY   */
/* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,   */
/* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE      */
/* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                 */
/**************************************************************************/

let midiInputs = [];

const GodotWebMidi = {
	$GodotWebMidi__deps: ['$GodotRuntime', '$GodotConfig', '$GodotEventListeners'],
	$GodotWebMidi: {
		init: null,
	},
	godot_js_webmidi_open_midi_inputs__deps: ['$GodotWebMidi'],
	godot_js_webmidi_open_midi_inputs__proxy: 'sync',
	godot_js_webmidi_open_midi_inputs__sig: 'iii',
	godot_js_webmidi_open_midi_inputs: function (p_set_input_names_cb, p_on_midi_message_cb) {
		const set_input_names_cb = GodotRuntime.get_func(p_set_input_names_cb);
		const on_midi_message_cb = GodotRuntime.get_func(p_on_midi_message_cb);
		console.log('open_midi_inputs');
		if (!navigator.requestMIDIAccess) {
			return 2; // ERR_UNAVAILABLE
		}

		navigator.requestMIDIAccess().then(midi => {
			const inputs = [...midi.inputs.values()];
			const input_names = inputs.map(input => input.name);

			console.log('JS inputs', input_names);

			const c_ptr = GodotRuntime.allocStringArray(input_names);
			set_input_names_cb(input_names.length, c_ptr);
			GodotRuntime.freeStringArray(c_ptr, input_names.length);

			const MAX_DATA_SIZE = 3;
			const c_ptr_data = GodotRuntime.malloc(MAX_DATA_SIZE * Uint8Array.BYTES_PER_ELEMENT);
			// TODO free

			inputs.forEach((input, i) => {
				input.addEventListener('midimessage', (event) => {
					const status = event.data[0];
					const data = event.data.slice(1);
					const size = data.length;

					if (size > MAX_DATA_SIZE) {
						throw new Error(`data too big ${size} > ${MAX_DATA_SIZE}`);
					}

					HEAPU8.set(data, c_ptr_data);
//					// https://stackoverflow.com/questions/71681491/passing-arrays-and-objects-from-javascript-to-c-in-web-assembly/77931005#77931005

					on_midi_message_cb(i, status, c_ptr_data, data.length);

				});
			});
		});

		return 0; // OK
	},
};

mergeInto(LibraryManager.library, GodotWebMidi);
