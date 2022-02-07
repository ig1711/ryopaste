import { useEffect, useState, Fragment, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight.js";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

const shortcuts = `== Shortcuts ==
Ctrl + / :: Toggle shortcut list
Ctrl + k :: Toggle usage of shortcuts
Ctrl + a :: Copy code
Ctrl + s :: Copy link
Ctrl + i :: New paste
Ctrl + h :: Show history`;

const Paste = () => {
  const router = useRouter();
  const { id } = router.query;

  const [shortcut, setShortcut] = useState(true);
  const [codeData, setCodeData] = useState({
    code: "",
    title: "Title",
    lang: "md",
  });
  const [view, setView] = useState("code");
  const [history, setHistory] = useState([]);
  const views = {
    loading: "Loading...",
    code: codeData.code,
    shortcut: shortcuts,
    history: "history",
  };

  useEffect(() => {
    if (!router.isReady) return;

    (async () => {
      setView("loading");
      const { data, error } = await supabase
        .from("Pastes")
        .select("id, code, lang, name")
        .eq("id", id);

      if (error) {
        setView("code");
        setCodeData({
          code: "Error occured, please try again",
          title: "Error",
          lang: "md",
        });
        return console.log(error);
      }

      if (!data.length) {
        setView("code");
        return setCodeData({
          code: "Paste not found, make sure you have the right link",
          title: "Not found",
          lang: "md",
        });
      }

      setView("code");
      setCodeData({
        code: data[0].code,
        title: data[0].name,
        lang: data[0].lang,
      });

      const h = window?.localStorage?.getItem("history");
      if (!h) {
        const newH = [{ id, title: data[0].name }];
        const newHa = JSON.stringify(newH);
        window?.localStorage?.setItem("history", newHa);
        return;
      }
      const ha = JSON.parse(h);
      const newH = ha.filter((f) => f.id !== id);
      const newHa = [{ id, title: data[0].name }, ...newH];
      const newHb = JSON.stringify(newHa);
      window?.localStorage?.setItem("history", newHb);
    })();
  }, [id, router.isReady]);

  useEffect(() => {
    if (view === "history") return;
    Prism.highlightAll();
  }, [view, codeData]);

  const copyLBtn = useRef(null);
  const copyCBtn = useRef(null);
  const historyBtn = useRef(null);

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShortcut((s) => !s);
      }
      if (!shortcut) return;
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        copyLBtn?.current?.click();
      }
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        historyBtn?.current?.click();
      }
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setView((v) => (v === "shortcut" ? "code" : "shortcut"));
      }
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        copyCBtn?.current?.click();
      }
      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        router?.push("/");
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [shortcut, router]);

  return (
    <>
      <Head>
        <title>Ryo Paste | {codeData.title}</title>
        <meta property="og:title" content={`Ryo Paste | ${codeData.title}`} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_URL || process.env.URL}${
            router.asPath
          }`}
        />
        <meta
          property="og:image"
          content="https://cdn.discordapp.com/attachments/760031614389452841/940176209545920592/ryopastelogo.png"
        />
        <meta property="og:description" content="Paste bin" />
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
            if (!h) return setView("history");
            const ha = JSON.parse(h);
            setHistory(ha);
            setView((v) => (v === "history" ? "code" : "history"));
          }}
        >
          History
        </button>
        <Link href="/">
          <a className="h-10 text-center text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2">
            New Paste
          </a>
        </Link>
        <span className="h-10 text-center text-white outline-none transition-all py-2">
          {codeData.title}
        </span>
        <button
          ref={copyCBtn}
          className="h-10 text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2"
          onClick={async () => {
            try {
              await navigator?.clipboard.writeText(codeData.code);
              alert("Copied code to clipboard");
            } catch (e) {
              alert(
                "Sorry, cannot copy the code using shortcut now. You need to first interact with the page using a mouse for that. -_- stupid browser rules"
              );
            }
          }}
        >
          Copy Code
        </button>
        <button
          ref={copyLBtn}
          className="h-10 text-[#999] hover:text-white focus:text-white hover:shadow-[0_1px_0_white] focus:shadow-[0_1px_0_white] outline-none transition-all py-2"
          onClick={async () => {
            const url = window?.location?.href;
            try {
              await navigator.clipboard.writeText(
                url ||
                  `${process.env.NEXT_PUBLIC_URL || process.env.URL}${
                    router.asPath
                  }`
              );
              alert("Copied link to clipboard");
            } catch (e) {
              alert(
                "Sorry, cannot copy the link using shortcut now. You need to first interact with the page using a mouse for that. -_- stupid browser rules"
              );
            }
          }}
        >
          Copy Link
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
                view === "code" ? codeData.lang : "asciidoc"
              } outline-none bg-transparent`}
            >
              {view === "history"
                ? history.map((h, i) => (
                    <Fragment key={h.id}>
                      <Link href={`/${h.id}`}>
                        <a
                          onClick={() => setView("code")}
                          className="flex hover:text-emerald-400"
                        >
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

export default Paste;