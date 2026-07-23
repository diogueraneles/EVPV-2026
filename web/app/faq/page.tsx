import Link from "next/link";

export const metadata = { title: "FAQ — Perguntas frequentes" };

const faqs: { q: string; a: React.ReactNode }[] = [];

export default function FaqPage() {
  return (
    <article className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Perguntas frequentes</h1>
        <p className="mt-2 text-lg text-slate-600">
          O jargão do Congresso explicado em linguagem simples.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Como o Eles Votam por Você funciona?
        </h2>
        <p className="text-slate-600">
          A Câmara dos Deputados e o Senado Federal publicam os dados de cada
          votação em seus portais de Dados Abertos. Nós coletamos esses registros
          todos os dias, organizamos as votações e as agrupamos em{" "}
          <Link href="/politicas" className="text-brand hover:underline">políticas</Link>{" "}
          — conjuntos de votações que, juntas, indicam uma posição sobre um
          assunto. A partir daí, calculamos o quanto cada parlamentar apoia ou
          rejeita cada política.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Que período o site cobre?
        </h2>
        <p className="text-slate-600">
          As votações do Senado começam em 2019 e as da Câmara em 2020, com
          atualização diária. Novas votações entram assim que os portais oficiais
          as publicam.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          O que é uma votação nominal?
        </h2>
        <p className="text-slate-600">
          É a votação em que o voto de cada parlamentar fica registrado com nome:
          Sim, Não, Abstenção ou Obstrução. É diferente da votação{" "}
          <em>simbólica</em>, em que o resultado é decidido no conjunto (pelos
          líderes ou por contagem visual) e ninguém tem o voto individual
          registrado.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Por que nem toda decisão do Congresso aparece aqui?
        </h2>
        <p className="text-slate-600">
          Porque a maioria das decisões é tomada por votação simbólica — e nelas
          não existe registro individual de voto. Só podemos mostrar como cada
          parlamentar votou quando a votação foi nominal. Muitas pautas
          importantes passam sem voto nominal, e por isso não geram score.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          O que é uma política e como ela é montada?
        </h2>
        <p className="text-slate-600">
          Uma política é um conjunto de votações sobre o mesmo assunto, com uma
          direção clara (ex.: &quot;Mais investimento na educação&quot;). Para
          cada votação incluída, definimos qual voto representa apoio — em
          algumas, votar SIM apoia a política; em outras (como flexibilizar uma
          proteção), votar NÃO é que apoia. Votações decisivas têm peso maior
          (marcadas com ★). Cada página de política lista todas as votações
          consideradas, com link para o projeto na íntegra no site oficial.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Quem decide se um parlamentar apoia uma política?
        </h2>
        <p className="text-slate-600">
          Ninguém — os votos decidem. Não importa o que o parlamentar diz em
          discurso ou campanha: o score é calculado apenas a partir de como ele
          votou nas votações da política. A curadoria humana está em escolher
          quais votações entram e qual é a direção de cada uma — e isso fica
          sempre visível e auditável na página da política.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          O que significa o percentual (score)?
        </h2>
        <p className="text-slate-600">
          É o apoio do parlamentar à política, de 0 a 100: 0 significa votar
          sempre contra a direção da política; 100, sempre a favor. Não é a
          fração de vezes em que votou &quot;sim&quot;. Os detalhes do cálculo
          estão na{" "}
          <Link href="/metodologia" className="text-brand hover:underline">metodologia</Link>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          E se o parlamentar faltou às votações?
        </h2>
        <p className="text-slate-600">
          Faltas pesam pouco no score, para não punir ausências pontuais — e quem
          tem pouquíssimos votos numa política aparece como &quot;sem votos
          suficientes&quot;, sem posição atribuída. Não conseguimos distinguir
          quem faltou por doença, missão oficial ou por escolha: o registro
          oficial não diz.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Por que não existe política sobre certos temas (aborto, direitos LGBTQIA+)?
        </h2>
        <p className="text-slate-600">
          Porque o plenário não votou esses temas nominalmente no período que
          cobrimos. Vários marcos recentes — casamento igualitário,
          criminalização da homofobia — vieram de decisões do STF, não de
          votações no Congresso. Quando houver votação nominal, a política é
          criada.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Como posso conferir se os dados estão certos?
        </h2>
        <p className="text-slate-600">
          Cada votação no site traz data, casa, placar e o link &quot;Ler o
          projeto na íntegra&quot; para a página oficial da Câmara ou do Senado —
          onde você confere o registro original, voto a voto. Encontrou
          divergência? Fale conosco em{" "}
          <a href="mailto:contato@elesvotamporvoce.org" className="text-brand hover:underline">
            contato@elesvotamporvoce.org
          </a>{" "}
          e corrigiremos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Quem faz este site? Tem partido?
        </h2>
        <p className="text-slate-600">
          O Eles Votam por Você é um projeto independente e sem fins lucrativos,
          sem vínculo com partidos, campanhas ou com o próprio Congresso. As
          políticas cobrem o espectro inteiro — em algumas quem pontua alto é a
          esquerda, em outras é a direita — porque o objetivo é mostrar o voto,
          não julgá-lo. Inspiração:{" "}
          <a href="https://theyvoteforyou.org.au" target="_blank" rel="noreferrer" className="text-brand hover:underline">
            They Vote For You
          </a>{" "}
          (Austrália).
        </p>
      </section>
    </article>
  );
}
