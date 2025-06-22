import { useState, useEffect } from "react";
import { Sound } from "@/types";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

type Props = {
    onAddSound: (s: Sound) => void;
    activeSounds?: Sound[];
    useRandomVariants: boolean;
    setUseRandomVariants: (v: boolean) => void;
};

export function LibraryAndMixes({
    onAddSound,
    activeSounds = [],
    useRandomVariants,
    setUseRandomVariants
}: Props) {
    let [cat, setCat] = useState("all");
    let [q, setQ] = useState("");
    let [show, setShow] = useState(false);

    let [data, setData] = useState<Sound[]>([]);
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sounds')
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    let catSet = new Set<string>();
    let cats: string[] = ["all"];
    data.forEach(s => {
        if (s.category) {
            let norm = s.category.trim().toLowerCase();
            if (!catSet.has(norm)) {
                catSet.add(norm);
                cats.push(norm);
            }
        }
    });

    function displayCat(c: string) {
        return c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1);
    }

    let arr: Sound[] = [];
    if (useRandomVariants) {
        arr = data;
    } else {
        data.forEach(s => {
            if (s.variants && s.variants.length > 1) {
                s.variants.forEach((v, j) => {
                    arr.push({
                        ...s,
                        id: s.id + "-" + (j + 1),
                        name: s.name + " " + (j + 1),
                        src: v,
                        isVariant: true,
                        variants: [v]
                    });
                });
            } else {
                arr.push(s);
            }
        });
    }

    let out = arr.filter(s =>
        (cat === "all" || (s.category && s.category.trim().toLowerCase() === cat)) &&
        s.name.toLowerCase().includes(q.toLowerCase())
    );

    function inMix(s: Sound) {
        if (!useRandomVariants) {
            return activeSounds.some(a => a.src === s.src);
        }
        let base = s.name.replace(/\s+#?\d+$/, '').toLowerCase();
        return activeSounds.some(a => a.name.replace(/\s+#?\d+$/, '').toLowerCase() === base);
    }

    function add(s: Sound) {
        if (useRandomVariants && s.variants && s.variants.length > 1) {
            let idx = Math.floor(Math.random() * s.variants.length);
            onAddSound({ ...s, src: s.variants[idx], id: s.id + "-" + Date.now() });
        } else {
            onAddSound(s);
        }
    }

    if (loading) {
        return <div style={{ padding: 16, textAlign: "center" }}>Loading...</div>;
    }

    return (
        <div className="lg:col-span-1 card rounded-xl p-4">
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Sound Library</div>
            <div style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Search..."
                    style={{
                        width: "100%",
                        padding: 8,
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        background: "transparent"
                    }}
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: 16 }}>
                <div className="flex flex-nowrap gap-2 overflow-x-visible">
                    {cats.slice(0, 3).map(c => (
                        <button
                            key={c}
                            className={`px-3 py-1 rounded-full text-sm shrink-0 category-pill ${cat === c ? "" : "inactive"}`}
                            onClick={() => { setCat(c); setShow(false); }}
                        >
                            {displayCat(c)}
                        </button>
                    ))}
                    <div className="relative shrink-0">
                        <button
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 
                                ${show ? "category-pill" : "category-pill inactive"} cursor-pointer transition-colors`}
                            onClick={() => setShow(!show)}
                            aria-label="More categories"
                        >
                            More <KeyboardArrowDownIcon className="text-sm" />
                        </button>
                        {show && (
                            <div className="absolute left-0 top-full mt-2 z-50 category-dropdown">
                                {cats.slice(3).map(c => (
                                    <button
                                        key={c}
                                        className={`text-sm ${cat === c ? "active" : "text-slate-300"}`}
                                        onClick={() => {
                                            setCat(c);
                                            setShow(false);
                                        }}
                                    >
                                        {displayCat(c)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center mb-4 bg-opacity-10 bg-primary dark:bg-opacity-15 p-3 rounded-lg">
                <label htmlFor="random-variants" className="flex items-center cursor-pointer w-full">
                    <div className="relative inline-flex items-center mr-2">
                        <input
                            type="checkbox"
                            id="random-variants"
                            checked={useRandomVariants}
                            onChange={e => setUseRandomVariants(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-teal-500 peer-focus:ring-2 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 bg-white dark:bg-slate-300 w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-slate-800 dark:text-slate-200">
                        {useRandomVariants ? "Randomize" : "Show all variants"}
                    </span>
                </label>
            </div>
            <div className="space-y-2">
                {out.map(s => {
                    let added = inMix(s);
                    return (
                        <div
                            key={s.id}
                            className={`p-3 rounded-lg flex justify-between items-center transition-colors sound-item ${added
                                ? "bg-slate-100 dark:bg-slate-600 text-muted-text cursor-default"
                                : "bg-card-bg dark:bg-card-bg cursor-move hover:bg-opacity-90"
                                }`}
                            draggable={!added}
                            onDragStart={e => {
                                if (!added) {
                                    e.dataTransfer.setData("sound", JSON.stringify(s));
                                }
                            }}
                            onClick={() => !added && add(s)}
                        >
                            <div>
                                <div className={`font-medium ${added ? "opacity-60" : ""}`}>
                                    {s.name}
                                    {added && <span className="ml-2 text-xs">(Added)</span>}
                                </div>
                                <div className="text-xs text-muted-text">
                                    {s.category}
                                    {useRandomVariants && s.variants && s.variants.length > 1 && (
                                        <span className="ml-2">({s.variants.length} variants)</span>
                                    )}
                                </div>
                            </div>
                            <button
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${added
                                    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed added-tick"
                                    : "play-button cursor-pointer"
                                    }`}
                                onClick={e => {
                                    e.stopPropagation();
                                    if (!added) {
                                        add(s);
                                    }
                                }}
                                disabled={added}
                            >
                                {added ? "✓" : "+"}
                            </button>
                        </div>
                    );
                })}
                {out.length === 0 && (
                    <div style={{ textAlign: "center", padding: 16, color: "#94a3b8" }}>
                        No sounds
                    </div>
                )}
            </div>
        </div>
    );
}