import { useEffect, useRef, useState, Fragment } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight.js";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/solid";

import languages from "../languages.json";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

const { Snowflake } = require("@sapphire/snowflake");
const epoch = new Date(process.env.NEXT_PUBLIC_EPOCH);
const snowflake = new Snowflake(epoch);

const url = process.env.NEXT_PUBLIC_URL;

const shortcuts = `== Shortcuts ==
Ctrl + / :: Toggle shortcut list
Ctrl + k :: Toggle usage of shortcuts
Ctrl + p :: Focus paste area
Ctrl + e :: Focus title area
Ctrl + l :: Select language
Ctrl + s :: Save the paste
Ctrl + h :: Show history`;

const Index = () => {
  const [value, setValue] = useState(
    "Paste your code in the paste box\nCtrl + / for shortcuts"
  );
  const [iValue, setIValue] = useState("Paste");
  const [name, setName] = useState("Untitled");
  const [selected, setSelected] = useState(languages[0]);
  const [shortcut, setShortcut] = useState(true);
  const [view, setView] = useState("code");
  const [history, setHistory] = useState([]);
  const router = useRouter();
  const views = {
    code: value,
    shortcut: shortcuts,
    history: "history",
  };

  useEffect(() => {
    if (view === "history") return;
    Prism.highlightAll();
  }, [value, selected, view]);

  const pasteRef = useRef(null);

  useEffect(() => {
    pasteRef?.current?.focus();
  }, []);

  const langButton = useRef(null);
  const saveBtn = useRef(null);
  const historyBtn = useRef(null);
  const titleRef = useRef(null);


  useEffect(() => {
    const keyHandler = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShortcut((s) => !s);
      }
      if (!shortcut) return;

      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveBtn?.current?.click();
      }
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        historyBtn?.current?.click();
      }
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setView((v) => (v === "shortcut" ? "code" : "shortcut"));
      }
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        langButton?.current?.click();
      }
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        pasteRef?.current?.focus();
      }
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        titleRef?.current?.focus();
      }
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [shortcut]);

  return (
    <>
      <Head>
        <title>Ryo Paste</title>
        <meta property="og:title" content="Ryo Paste" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta
          property="og:image"
          content="https://cdn.discordapp.com/attachments/760031614389452841/940176209545920592/ryopastelogo.png"
        />
        <meta property="og:description" content="A pastebin or text storage site is a type of online content-hosting service where users can store plain text and share them using a link" />
        <meta property="og:site_name" content="Ryo Paste" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#ff006a"
        />
      </Head>
      <div className="fixed bottom-0 left-0 h-12 w-full border-[1px] border-transparent border-t-[#999] bg-stone-800 shadow-xl shadow-black p-2 grid grid-cols-5 place-content-center place-items-stretch z-10">
        <button
          ref={historyBtn}
          className="h-10 text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2"
          onClick={() => {
            const h = window?.localStorage?.getItem("history");
            if (!h) return setView((v) => (v === "history" ? "code" : "history"));
            const ha = JSON.parse(h);
            setHistory(ha);
            setView((v) => (v === "history" ? "code" : "history"));
          }}
        >
          History
        </button>
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative">
            <Listbox.Button
              ref={langButton}
              className="h-10 w-full bg-transparent cursor-default text-[#999] hover:text-white text-center outline-none focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] transition-all py-2"
            >
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
          ref={titleRef}
          type="text"
          placeholder="Title"
          value={name}
          onFocus={() => setName("")}
          onInput={(e) => setName(e.target.value)}
          className="h-10 bg-transparent text-[#999] hover:text-white text-center outline-none focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] transition-all py-2"
        />
        <button
          ref={saveBtn}
          className="h-10 text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2"
          onClick={async () => {
            const buid = snowflake.generate();
            const uid = buid.toString();
            await supabase
              .from("Pastes")
              .insert([
                { id: uid, code: value, lang: selected.codes[0], name: name },
              ]);
            router.push(`/${uid}`);
          }}
        >
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
              className={`language-${
                view === "code" ? selected.codes[0] : "asciidoc"
              } outline-none bg-transparent`}
            >
              {view === "history"
                ? history.map((h, i) => (
                    <Fragment key={h.id}>
                      <Link href={`/${h.id}`}>
                        <a className="flex hover:text-emerald-400">
                          <span className="flex-[1]">{i + 1}</span>
                          <span className="flex-[4]">{h.title}</span>
                          <span className="flex-[8] underline">
                            {process.env.NEXT_PUBLIC_URL || process.env.URL}/
                            {h.id}
                          </span>
                        </a>
                      </Link>
                    </Fragment>
                  ))
                : views[view]}
            </code>
          </pre>
        </div>
      </div>
    </>
  );
};

export default Index;
