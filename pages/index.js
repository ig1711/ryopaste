import { useEffect, useRef, useState, Fragment } from "react";
import Head from "next/head";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight.js";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/solid";

import languages from "../languages.json";

const Index = () => {
  const [value, setValue] = useState("");
  const [iValue, setIValue] = useState("Paste");
  const [name, setName] = useState("Untitled");
  const [selected, setSelected] = useState(languages[0]);

  useEffect(() => {
    Prism.highlightAll();
  }, [value, selected]);

  const pasteRef = useRef(null);

  useEffect(() => {
    pasteRef?.current?.focus();
  }, []);

  return (
    <>
      <Head>
        <title>Ryo Paste</title>
      </Head>
      <div className="fixed bottom-0 left-0 h-12 w-full border-[1px] border-transparent border-t-[#999] bg-stone-800 shadow-xl shadow-black p-2 grid grid-cols-5 place-content-center place-items-stretch z-10">
        <button className="h-10 text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2">
          History
        </button>
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative">
            <Listbox.Button className="h-10 w-full bg-transparent cursor-default text-[#999] hover:text-white text-center outline-none focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] transition-all py-2">
              <span className="truncate">{selected.name}</span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                style={{ "scrollbar-width": "none" }}
                className="bottom-12 absolute w-full py-1 mt-1 overflow-auto text-base bg-stone-800 rounded-sm shadow-xl shadow-black max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                {languages.map((lang) => (
                  <Listbox.Option
                    key={lang.codes[0]}
                    className={({ active }) =>
                      `${active ? "text-amber-300 bg-stone-500" : "text-[#999]"}
                          cursor-default select-none relative py-2 pl-10 pr-4`
                    }
                    value={lang}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`${
                            selected ? "font-medium" : "font-normal"
                          } block truncate`}
                        >
                          {lang.name}
                        </span>
                        {selected ? (
                          <span
                            className={`${
                              active ? "text-amber-600" : "text-amber-600"
                            }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        <textarea
          ref={pasteRef}
          placeholder="Paste"
          className="h-10 bg-transparent resize-none text-[#999] hover:text-white text-center outline-none focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] transition-all py-2"
          type="text"
          value={iValue}
          onInput={(e) => {
            e.target.blur();
            setIValue("Paste");
            setValue(e.target.value);
          }}
          onFocus={() => setIValue("")}
        />
        <input
          type="text"
          placeholder="Title"
          value={name}
          onFocus={() => setName("")}
          onInput={(e) => setName(e.target.value)}
          className="h-10 bg-transparent text-[#999] hover:text-white text-center outline-none focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] transition-all py-2"
        />
        <button className="h-10 text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2">
          Save
        </button>
      </div>
      <div className="h-screen overflow-y-scroll bg-stone-800 grid grid-cols-1 place-items-center pt-6 pb-20">
        <div className="bg-stone-800 w-full sm:w-4/5 shadow-xl shadow-black py-2">
          <pre
            id="code"
            className="linkable-line-numbers line-numbers"
            style={{ background: "none" }}
          >
            <code
              className={`language-${selected.codes[0]} outline-none bg-transparent`}
            >
              {value}
            </code>
          </pre>
        </div>
      </div>
    </>
  );
};

export default Index;
