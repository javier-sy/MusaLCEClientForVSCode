# musa-dsl-atom-repl

A Visual Studio Code extension to allow a Read-Eval-Print-Loop connected to a Musa-DSL REPL server.

[Musa-DSL](https://github.com/javier-sy/musa-dsl) is a Ruby Domain Specific Language for algorithmic musical composition.

The Musa-DSL server should be implemented creating a new REPL instance inside the binding context of the sequencer DSL. A simple instantiation scenario is the following:

```ruby
require 'musa-dsl'
require 'unimidi'

clock_input = UniMIDI::Input.all.select { |x| x.name == 'Apple Inc. Driver IAC' }[1]
output = UniMIDI::Output.all.select { |x| x.name == 'Apple Inc. Driver IAC' }[1]

clock = Musa::InputMidiClock.new clock_input

voices = Musa::MIDIVoices.new sequencer: transport.sequencer, output: output, channels: [0]

transport = Musa::Transport.new clock, 1, 24

transport.sequencer.with do
  Musa::REPL.new binding
end

transport.start
```

This opens a REPL socket in localhost:1327. MusaLCEClientForVSCode extension automatically connects to this default server.

Keystrokes inside Visual Studio Code:

* *Ctrl-Alt-M:* opens the Musa-DSL REPL Status panel. This panel shows the responses from the server when it evals the commands sent from the Atom client. The response includes the inmediate response and the future responses for the commands that develop in time.

* *Ctrl-Alt-Return:* sends current selection or current line (if nothing is selected) as a command to Musa-DSL REPL server. The response is shown in Musa-DSL REPL Status panel.
