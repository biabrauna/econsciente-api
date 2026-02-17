--
-- PostgreSQL database dump
--

\restrict W9hu7zm5AS8cWPPtxF3U6HgTnGYQIcRsmRlV5fGR2gf0XuKhZc6cRLEnnY21vNk

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comentarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    "userName" text NOT NULL,
    texto text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.comentarios OWNER TO postgres;

--
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comentarios_id_seq OWNER TO postgres;

--
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- Name: conquistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conquistas (
    id integer NOT NULL,
    nome text NOT NULL,
    descricao text NOT NULL,
    icone text NOT NULL,
    tipo text NOT NULL,
    criterio text NOT NULL,
    "pontosRecompensa" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conquistas OWNER TO postgres;

--
-- Name: conquistas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conquistas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conquistas_id_seq OWNER TO postgres;

--
-- Name: conquistas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conquistas_id_seq OWNED BY public.conquistas.id;


--
-- Name: conquistas_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conquistas_usuarios (
    id integer NOT NULL,
    "conquistaId" integer NOT NULL,
    "userId" integer NOT NULL,
    "desbloqueadaEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conquistas_usuarios OWNER TO postgres;

--
-- Name: conquistas_usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conquistas_usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conquistas_usuarios_id_seq OWNER TO postgres;

--
-- Name: conquistas_usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conquistas_usuarios_id_seq OWNED BY public.conquistas_usuarios.id;


--
-- Name: desafios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.desafios (
    id integer NOT NULL,
    desafios text NOT NULL,
    valor integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.desafios OWNER TO postgres;

--
-- Name: desafios_concluidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.desafios_concluidos (
    id integer NOT NULL,
    "desafioId" integer NOT NULL,
    "userId" integer NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.desafios_concluidos OWNER TO postgres;

--
-- Name: desafios_concluidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.desafios_concluidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.desafios_concluidos_id_seq OWNER TO postgres;

--
-- Name: desafios_concluidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.desafios_concluidos_id_seq OWNED BY public.desafios_concluidos.id;


--
-- Name: desafios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.desafios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.desafios_id_seq OWNER TO postgres;

--
-- Name: desafios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.desafios_id_seq OWNED BY public.desafios.id;


--
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    id integer NOT NULL,
    "followerId" integer NOT NULL,
    "followingId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- Name: follows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.follows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follows_id_seq OWNER TO postgres;

--
-- Name: follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.follows_id_seq OWNED BY public.follows.id;


--
-- Name: notificacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacoes (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    tipo text NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notificacoes OWNER TO postgres;

--
-- Name: notificacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificacoes_id_seq OWNER TO postgres;

--
-- Name: notificacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificacoes_id_seq OWNED BY public.notificacoes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    texto text NOT NULL,
    imagens text[],
    curtidas integer DEFAULT 0 NOT NULL,
    comentarios integer DEFAULT 0 NOT NULL,
    "desafioId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: profile_pics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_pics (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    name text,
    url text NOT NULL
);


ALTER TABLE public.profile_pics OWNER TO postgres;

--
-- Name: profile_pics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_pics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_pics_id_seq OWNER TO postgres;

--
-- Name: profile_pics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_pics_id_seq OWNED BY public.profile_pics.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "sessionToken" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastActivity" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: user_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_likes (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "postId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_likes OWNER TO postgres;

--
-- Name: user_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_likes_id_seq OWNER TO postgres;

--
-- Name: user_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_likes_id_seq OWNED BY public.user_likes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    biografia text DEFAULT ''::text NOT NULL,
    "dataNascimento" timestamp(3) without time zone NOT NULL,
    nivel integer DEFAULT 1 NOT NULL,
    pontos integer DEFAULT 0 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    seguidores integer DEFAULT 0 NOT NULL,
    seguindo integer DEFAULT 0 NOT NULL,
    "onboardingCompleted" boolean DEFAULT false NOT NULL,
    "onboardingSteps" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "onboardingSkippedAt" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- Name: conquistas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas ALTER COLUMN id SET DEFAULT nextval('public.conquistas_id_seq'::regclass);


--
-- Name: conquistas_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuarios ALTER COLUMN id SET DEFAULT nextval('public.conquistas_usuarios_id_seq'::regclass);


--
-- Name: desafios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafios ALTER COLUMN id SET DEFAULT nextval('public.desafios_id_seq'::regclass);


--
-- Name: desafios_concluidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafios_concluidos ALTER COLUMN id SET DEFAULT nextval('public.desafios_concluidos_id_seq'::regclass);


--
-- Name: follows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows ALTER COLUMN id SET DEFAULT nextval('public.follows_id_seq'::regclass);


--
-- Name: notificacoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes ALTER COLUMN id SET DEFAULT nextval('public.notificacoes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: profile_pics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_pics ALTER COLUMN id SET DEFAULT nextval('public.profile_pics_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: user_likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_likes ALTER COLUMN id SET DEFAULT nextval('public.user_likes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: comentarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentarios (id, "postId", "userId", "userName", texto, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: conquistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conquistas (id, nome, descricao, icone, tipo, criterio, "pontosRecompensa", "createdAt", "updatedAt") FROM stdin;
1	Primeiro Passo Verde	Faça upload de sua primeira foto de perfil	🌱	perfil	{"action":"upload_profile_pic","amount":1}	10	2025-10-05 04:13:17.335	2025-10-05 04:13:17.335
2	Identidade Ecológica	Complete sua biografia no perfil	📝	perfil	{"action":"update_bio","amount":1}	10	2025-10-05 04:13:17.901	2025-10-05 04:13:17.901
3	Eco Iniciante	Complete seu primeiro desafio ecológico	✅	desafios	{"action":"complete_challenge","amount":1}	15	2025-10-05 04:13:18.436	2025-10-05 04:13:18.436
4	Eco Comprometido	Complete 5 desafios ecológicos	🏅	desafios	{"action":"complete_challenge","amount":5}	50	2025-10-05 04:13:18.972	2025-10-05 04:13:18.972
5	Eco Guerreiro	Complete 10 desafios ecológicos	⭐	desafios	{"action":"complete_challenge","amount":10}	100	2025-10-05 04:13:19.508	2025-10-05 04:13:19.508
6	Voz Verde	Crie seu primeiro post	💬	social	{"action":"create_post","amount":1}	10	2025-10-05 04:13:20.227	2025-10-05 04:13:20.227
7	Influencer Verde	Crie 10 posts	📢	social	{"action":"create_post","amount":10}	50	2025-10-05 04:13:20.793	2025-10-05 04:13:20.793
8	Colecionador de Pontos	Acumule 100 pontos	💎	pontos	{"action":"earn_points","amount":100}	25	2025-10-05 04:13:21.341	2025-10-05 04:13:21.341
9	Eco Mestre	Acumule 500 pontos	🏆	pontos	{"action":"earn_points","amount":500}	100	2025-10-05 04:13:21.899	2025-10-05 04:13:21.899
10	Lenda Verde	Acumule 1000 pontos	👑	pontos	{"action":"earn_points","amount":1000}	200	2025-10-05 04:13:22.451	2025-10-05 04:13:22.451
\.


--
-- Data for Name: conquistas_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conquistas_usuarios (id, "conquistaId", "userId", "desbloqueadaEm") FROM stdin;
\.


--
-- Data for Name: desafios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.desafios (id, desafios, valor, "createdAt", "updatedAt") FROM stdin;
1	Separe o lixo reciclável da sua casa durante um dia e envie uma foto para o app	5	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
2	Recolha uma garrafa PET, lata ou embalagem e entregue para reciclagem	5	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
3	Recolha 10 tampinhas plásticas e registre a coleta no app	5	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
4	Use um pote ou embalagem reciclável para guardar algo em casa	5	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
5	Use uma sacola reutilizável em uma compra e tire uma foto para o app	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
6	Entregue ao menos uma pilha ou bateria usada em um local apropriado	5	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
7	Remova rótulos de garrafas ou potes antes de reciclá-los e registre a ação	5	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
8	Lave e recicle 3 embalagens plásticas ou metálicas antes de descartá-las	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
9	Separe algum lixo reciclável do trabalho ou escola e leve para casa ou para um ponto de coleta	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
10	Coloque um lembrete visível em casa para separar recicláveis	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
11	. Pegue materiais recicláveis de um vizinho que não recicla e leve ao ponto correto	15	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
12	Durante uma caminhada, encontre e recicle ao menos 5 itens jogados na chão e registre o momento	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
13	Junte pelo menos 3 garrafas de vidro para reciclagem	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
14	Junte 30 latinhas e recicle em um ponto de coleta	20	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
15	. Separe resíduos descartáveis e não descartáveis dentro de sua casa durante 3 dias e descarte em um ponto de coleta	20	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
16	Dê uma dica sobre reciclagem para um amigo e registre no app ele executando	15	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
17	Crie algo criativo com recicláveis, como um brinquedo, decoração ou utensílio, e envie uma foto do item final	25	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
18	Junte 50 tampinhas e leve à um ponto de coleta	20	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
19	Plante uma muda de árvore ou planta usando um vaso feito de material reciclável	30	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
20	Compartilhe o aplicativo com um amigo e envie um print de confirmação	10	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
21	Agora, verifique se este amigo cumpriu pelo menos 5 desafios de reciclagem e envie um print de confirmação	30	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
22	Personalize uma latinha com algo que você goste muito	15	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
23	Convide um amigo para competir quem junta mais recicláveis em uma semana. Ambos devera levar os recicláveis até um ponto de coleta e registrar sua pontuação através de uma foto.	40	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
24	Crie uma decoração de Natal com materiais recicláveis	40	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
25	Encontre ao menos 5 itens recicláveis descartados na rua e deposite no lugar correto, registrando com uma foto	30	2025-09-30 22:43:54.145	2025-09-30 22:43:54.145
26	Usar garrafa reutilizável por uma semana	20	2025-12-27 20:07:58.066	2025-12-27 20:07:58.066
27	Separar o lixo reciclável por 3 dias consecutivos	15	2025-12-27 20:07:58.897	2025-12-27 20:07:58.897
28	Não usar plástico descartável por um dia	10	2025-12-27 20:07:59.585	2025-12-27 20:07:59.585
29	Fazer compostagem de resíduos orgânicos	25	2025-12-27 20:08:00.269	2025-12-27 20:08:00.269
30	Usar transporte público ou bicicleta por uma semana	30	2025-12-27 20:08:01.089	2025-12-27 20:08:01.089
31	Desligar aparelhos da tomada quando não estiver usando	10	2025-12-27 20:08:01.909	2025-12-27 20:08:01.909
32	Tomar banhos de no máximo 5 minutos por 3 dias	15	2025-12-27 20:08:02.692	2025-12-27 20:08:02.692
33	Plantar uma árvore ou cultivar uma planta	25	2025-12-27 20:08:03.543	2025-12-27 20:08:03.543
34	Fazer uma refeição sem carne (segunda sem carne)	10	2025-12-27 20:08:04.27	2025-12-27 20:08:04.27
35	Reutilizar sacolas de pano para compras	10	2025-12-27 20:08:05.045	2025-12-27 20:08:05.045
36	Criar um produto a partir de material reciclado	30	2025-12-27 20:08:05.739	2025-12-27 20:08:05.739
37	Organizar uma limpeza em área pública (praia, parque)	40	2025-12-27 20:08:06.514	2025-12-27 20:08:06.514
38	Reduzir o consumo de papel usando anotações digitais	15	2025-12-27 20:08:07.256	2025-12-27 20:08:07.256
39	Compartilhar conhecimento sobre sustentabilidade com 3 pessoas	20	2025-12-27 20:08:07.928	2025-12-27 20:08:07.928
40	Usar produtos de limpeza ecológicos por uma semana	20	2025-12-27 20:08:08.631	2025-12-27 20:08:08.631
41	Consertar algo em vez de jogar fora	15	2025-12-27 20:08:09.483	2025-12-27 20:08:09.483
42	Comprar produtos locais e da estação	15	2025-12-27 20:08:10.317	2025-12-27 20:08:10.317
43	Evitar fast fashion - não comprar roupas novas por um mês	35	2025-12-27 20:08:11.533	2025-12-27 20:08:11.533
44	Fazer uma doação de itens que você não usa mais	20	2025-12-27 20:08:12.353	2025-12-27 20:08:12.353
45	Usar iluminação natural durante o dia	10	2025-12-27 20:08:13.066	2025-12-27 20:08:13.066
\.


--
-- Data for Name: desafios_concluidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.desafios_concluidos (id, "desafioId", "userId", "completedAt") FROM stdin;
6	45	38	2026-01-20 22:48:04.075
\.


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows (id, "followerId", "followingId", "createdAt") FROM stdin;
9	38	37	2026-01-20 22:36:59.776
\.


--
-- Data for Name: notificacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacoes (id, "userId", tipo, mensagem, lida, "createdAt") FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, "userId", texto, imagens, curtidas, comentarios, "desafioId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: profile_pics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile_pics (id, "userId", name, url) FROM stdin;
1	38	bia	https://res.cloudinary.com/dnulz0tix/image/upload/v1768951492/frgy7yxvas7tdragfp8u.jpg
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, "userId", "sessionToken", "isActive", "lastActivity", "expiresAt", "ipAddress", "userAgent", "createdAt") FROM stdin;
24	37	fee2e1529db7dd0303da2a03a61f840073fdf4c641d1c033a45a1f7ea41286fa	t	2026-01-07 16:15:18.077	2026-02-06 16:15:18.077	\N	\N	2026-01-07 16:15:18.077
25	38	3305f945b6842f3777f0cdad6d5b383ce8551017fc5e5f8d03dfa996fd2bffbd	f	2026-01-07 17:19:05.978	2026-02-06 17:19:05.978	\N	\N	2026-01-07 17:19:05.978
26	38	90f7ac2077e70b5e0763b80ae1b27f8ae13ff6dd4d5d63bd8dc53d08cc146dd6	f	2026-01-16 14:24:25.287	2026-02-15 14:24:25.287	\N	\N	2026-01-16 14:24:25.287
27	38	49128449506cde77af4ace0babbdaa79265ed81c05482b4c76bc0f29295440cb	t	2026-01-16 14:33:11.116	2026-02-15 14:33:11.116	\N	\N	2026-01-16 14:33:11.116
28	39	ca1d54456738b49442ca07c30da21e6e44441d104034911fd058e12075143c5a	t	2026-01-17 03:15:13.197	2026-02-16 03:15:13.197	\N	\N	2026-01-17 03:15:13.197
29	39	33a65d593b2032c07f69e0f6058ea309d7a657eae123255a110c2a6d74b15481	t	2026-01-17 03:16:51.943	2026-02-16 03:16:51.943	\N	\N	2026-01-17 03:16:51.943
30	38	047ae1b5cb9516fe912787d6ef27397ea2721aefea45e92d7db53f0d35e798ba	t	2026-01-20 21:51:29.693	2026-02-19 21:51:29.693	\N	\N	2026-01-20 21:51:29.693
\.


--
-- Data for Name: user_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_likes (id, "userId", "postId", "createdAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, biografia, "dataNascimento", nivel, pontos, xp, seguidores, seguindo, "onboardingCompleted", "onboardingSteps", "createdAt", "updatedAt", "onboardingSkippedAt") FROM stdin;
38	bia@gmail.com	$2b$12$9Z5ElDXqw6E.0zpAnMtby.v3DqS1pxo3kKxqg06quJDwa4lrW29Ri	bia	Sou legal	2002-08-29 00:00:00	8	420	4200	0	1	t	"{\\"profilePic\\":true,\\"bio\\":true,\\"firstChallenge\\":true}"	2026-01-07 17:18:52.151	2026-01-20 23:24:58.261	\N
39	teste@teste.com	$2b$12$32ZKw3HEg8XLQFwlcgM0wutb8hJaxc1xC0Slrjun5QNxpsFX9VK6S	Test User		1990-01-01 00:00:00	1	0	0	0	0	f	\N	2026-01-17 03:14:52.56	2026-01-17 03:14:52.56	\N
37	joao@test.com	$2b$12$T7N3XiCM9prpsTXDR9iA.em2jLuTdCv3UD/Fp5qd/s3sIDZ7href6	João Silva	Test user	1998-01-01 00:00:00	1	0	0	1	0	f	\N	2026-01-07 16:15:17.513	2026-01-20 22:36:59.836	\N
\.


--
-- Name: comentarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comentarios_id_seq', 1, false);


--
-- Name: conquistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conquistas_id_seq', 10, true);


--
-- Name: conquistas_usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conquistas_usuarios_id_seq', 1, false);


--
-- Name: desafios_concluidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.desafios_concluidos_id_seq', 6, true);


--
-- Name: desafios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.desafios_id_seq', 45, true);


--
-- Name: follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.follows_id_seq', 9, true);


--
-- Name: notificacoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificacoes_id_seq', 5, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 8, true);


--
-- Name: profile_pics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_pics_id_seq', 1, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessions_id_seq', 30, true);


--
-- Name: user_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_likes_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 39, true);


--
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- Name: conquistas conquistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas
    ADD CONSTRAINT conquistas_pkey PRIMARY KEY (id);


--
-- Name: conquistas_usuarios conquistas_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuarios
    ADD CONSTRAINT conquistas_usuarios_pkey PRIMARY KEY (id);


--
-- Name: desafios_concluidos desafios_concluidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafios_concluidos
    ADD CONSTRAINT desafios_concluidos_pkey PRIMARY KEY (id);


--
-- Name: desafios desafios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafios
    ADD CONSTRAINT desafios_pkey PRIMARY KEY (id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: profile_pics profile_pics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_pics
    ADD CONSTRAINT profile_pics_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: user_likes user_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_likes
    ADD CONSTRAINT user_likes_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: comentarios_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comentarios_createdAt_idx" ON public.comentarios USING btree ("createdAt");


--
-- Name: comentarios_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comentarios_postId_idx" ON public.comentarios USING btree ("postId");


--
-- Name: comentarios_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comentarios_userId_idx" ON public.comentarios USING btree ("userId");


--
-- Name: conquistas_nome_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conquistas_nome_idx ON public.conquistas USING btree (nome);


--
-- Name: conquistas_nome_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX conquistas_nome_key ON public.conquistas USING btree (nome);


--
-- Name: conquistas_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conquistas_tipo_idx ON public.conquistas USING btree (tipo);


--
-- Name: conquistas_usuarios_conquistaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conquistas_usuarios_conquistaId_idx" ON public.conquistas_usuarios USING btree ("conquistaId");


--
-- Name: conquistas_usuarios_userId_conquistaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "conquistas_usuarios_userId_conquistaId_key" ON public.conquistas_usuarios USING btree ("userId", "conquistaId");


--
-- Name: conquistas_usuarios_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conquistas_usuarios_userId_idx" ON public.conquistas_usuarios USING btree ("userId");


--
-- Name: desafios_concluidos_desafioId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "desafios_concluidos_desafioId_idx" ON public.desafios_concluidos USING btree ("desafioId");


--
-- Name: desafios_concluidos_userId_desafioId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "desafios_concluidos_userId_desafioId_key" ON public.desafios_concluidos USING btree ("userId", "desafioId");


--
-- Name: desafios_concluidos_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "desafios_concluidos_userId_idx" ON public.desafios_concluidos USING btree ("userId");


--
-- Name: desafios_desafios_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX desafios_desafios_idx ON public.desafios USING btree (desafios);


--
-- Name: follows_followerId_followingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON public.follows USING btree ("followerId", "followingId");


--
-- Name: follows_followerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "follows_followerId_idx" ON public.follows USING btree ("followerId");


--
-- Name: follows_followingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "follows_followingId_idx" ON public.follows USING btree ("followingId");


--
-- Name: notificacoes_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notificacoes_createdAt_idx" ON public.notificacoes USING btree ("createdAt");


--
-- Name: notificacoes_userId_lida_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notificacoes_userId_lida_idx" ON public.notificacoes USING btree ("userId", lida);


--
-- Name: posts_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "posts_createdAt_idx" ON public.posts USING btree ("createdAt");


--
-- Name: posts_desafioId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "posts_desafioId_idx" ON public.posts USING btree ("desafioId");


--
-- Name: posts_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "posts_userId_idx" ON public.posts USING btree ("userId");


--
-- Name: profile_pics_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "profile_pics_userId_key" ON public.profile_pics USING btree ("userId");


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_sessionToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_sessionToken_idx" ON public.sessions USING btree ("sessionToken");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: user_likes_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_likes_postId_idx" ON public.user_likes USING btree ("postId");


--
-- Name: user_likes_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_likes_userId_idx" ON public.user_likes USING btree ("userId");


--
-- Name: user_likes_userId_postId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_likes_userId_postId_key" ON public.user_likes USING btree ("userId", "postId");


--
-- Name: users_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_createdAt_idx" ON public.users USING btree ("createdAt");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: comentarios comentarios_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT "comentarios_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comentarios comentarios_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT "comentarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conquistas_usuarios conquistas_usuarios_conquistaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuarios
    ADD CONSTRAINT "conquistas_usuarios_conquistaId_fkey" FOREIGN KEY ("conquistaId") REFERENCES public.conquistas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conquistas_usuarios conquistas_usuarios_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuarios
    ADD CONSTRAINT "conquistas_usuarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: desafios_concluidos desafios_concluidos_desafioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafios_concluidos
    ADD CONSTRAINT "desafios_concluidos_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES public.desafios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: desafios_concluidos desafios_concluidos_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafios_concluidos
    ADD CONSTRAINT "desafios_concluidos_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: follows follows_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: follows follows_followingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notificacoes notificacoes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT "notificacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_desafioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES public.desafios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: posts posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profile_pics profile_pics_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_pics
    ADD CONSTRAINT "profile_pics_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_likes user_likes_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_likes
    ADD CONSTRAINT "user_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_likes user_likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_likes
    ADD CONSTRAINT "user_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict W9hu7zm5AS8cWPPtxF3U6HgTnGYQIcRsmRlV5fGR2gf0XuKhZc6cRLEnnY21vNk

