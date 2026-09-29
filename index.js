let plansza = [];
let planszaStartowa = [];
let wybranaKomorka = null;

const tabela = document.getElementById('tablica');
const btnRestart = document.getElementById('btn-restart');
const przyciskiPoziomow = document.querySelectorAll('.btn-diff');

const POZIOMY = {
    latwy: 32,
    sredni: 46,
    trudny: 56
};

let aktualnyPoziom = 'latwy';

const czyPasuje = (wiersz, kolumna, liczba, siatka = plansza) => {
    for (let k = 0; k < 9; k++) {
        if (k !== kolumna && siatka[wiersz][k] === liczba) {
            return false;
        }
    }

    for (let w = 0; w < 9; w++) {
        if (w !== wiersz && siatka[w][kolumna] === liczba) {
            return false;
        }
    }

    const startWiersz = Math.floor(wiersz / 3) * 3;
    const startKolumna = Math.floor(kolumna / 3) * 3;
    for (let w = 0; w < 3; w++) {
        for (let k = 0; k < 3; k++) {
            const aktWiersz = startWiersz + w;
            const aktKolumna = startKolumna + k;
            if (!(aktWiersz === wiersz && aktKolumna === kolumna) && siatka[aktWiersz][aktKolumna] === liczba) {
                return false;
            }
        }
    }

    return true;
};

const generowaniePelnejPlanszy = () => {
    plansza = Array(9).fill(null).map(() => Array(9).fill(0));

    const znajdzPuste = () => {
        for (let w = 0; w < 9; w++) {
            for (let k = 0; k < 9; k++) {
                if (plansza[w][k] === 0) return { w, k };
            }
        }
        return null;
    };

    const tasowanieLiczb = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const wypelnij = () => {
        const puste = znajdzPuste();
        if (!puste) return true;

        const { w, k } = puste;
        const liczby = tasowanieLiczb([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let liczba of liczby) {
            if (czyPasuje(w, k, liczba)) {
                plansza[w][k] = liczba;
                if (wypelnij()) return true;
                plansza[w][k] = 0;
            }
        }
        return false;
    };

    wypelnij();
};

const usunCyfry = (liczbaDoUsuniecia) => {
    let usuniete = 0;
    while (usuniete < liczbaDoUsuniecia) {
        const randomW = Math.floor(Math.random() * 9);
        const randomK = Math.floor(Math.random() * 9);

        if (plansza[randomW][randomK] !== "") {
            plansza[randomW][randomK] = "";
            usuniete++;
        }
    }
};

const wyswietlaniePlanszy = () => {
    tabela.innerHTML = plansza.map((wiersz, w) => `
        <tr>
            ${wiersz.map((wartosc, k) => {
                const czyStartowa = planszaStartowa[w][k] !== "";
                const klasaStartowa = czyStartowa ? "startowa" : "gracz";
                return `<td data-w="${w}" data-k="${k}" class="${klasaStartowa}">${wartosc}</td>`;
            }).join("")}
        </tr>
    `).join("");
};

const czyWszystkoWypelnione = () => {
    for (let w = 0; w < 9; w++) {
        for (let k = 0; k < 9; k++) {
            const val = plansza[w][k];
            if (val === "" || val === 0 || !czyPasuje(w, k, val)) {
                return false;
            }
        }
    }
    return true;
};

const nowaGra = () => {
    wybranaKomorka = null;
    generowaniePelnejPlanszy();
    usunCyfry(POZIOMY[aktualnyPoziom]);
    planszaStartowa = plansza.map(wiersz => [...wiersz]);
    wyswietlaniePlanszy();
};

tabela.addEventListener('click', (e) => {
    const td = e.target.closest('td');
    if (!td) return;

    wybranaKomorka = td;

    const klikW = Number(td.dataset.w);
    const klikK = Number(td.dataset.k);
    const klikBlokW = Math.floor(klikW / 3);
    const klikBlokK = Math.floor(klikK / 3);

    tabela.querySelectorAll('td').forEach(komorka => {
        komorka.classList.remove("aktywna", "podswietlona");

        const w = Number(komorka.dataset.w);
        const k = Number(komorka.dataset.k);
        const blokW = Math.floor(w / 3);
        const blokK = Math.floor(k / 3);

        const tenSamWiersz = w === klikW;
        const taSamaKolumna = k === klikK;
        const tenSamBlok = blokK === klikBlokK && blokW === klikBlokW;

        if (komorka === td) {
            komorka.classList.add("aktywna");
        } else if (tenSamWiersz || taSamaKolumna || tenSamBlok) {
            komorka.classList.add("podswietlona");
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (!wybranaKomorka) return;

    const w = Number(wybranaKomorka.dataset.w);
    const k = Number(wybranaKomorka.dataset.k);

    if (planszaStartowa[w][k] !== "") return;

    if (e.key >= "1" && e.key <= "9") {
        const val = Number(e.key);
        plansza[w][k] = val;
        wybranaKomorka.textContent = val;

        if (czyWszystkoWypelnione()) {
            setTimeout(() => alert("Gratulacje, wygrałeś!"), 60);
        }
    } else if (e.key === "Backspace" || e.key === "Delete") {
        plansza[w][k] = "";
        wybranaKomorka.textContent = "";
    }
});

przyciskiPoziomow.forEach(btn => {
    btn.addEventListener('click', () => {
        przyciskiPoziomow.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        aktualnyPoziom = btn.dataset.level;
        nowaGra();
    });
});

btnRestart.addEventListener('click', nowaGra);

nowaGra();