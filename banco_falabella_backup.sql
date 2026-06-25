--
-- PostgreSQL database dump
--

\restrict zMwoJ8qFQueapbYDZdf5DgXTOGtOoraNO3zk20ZXYUftRjDiDZQhYflOKymjy6V

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-06-24 19:32:51

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

--
-- TOC entry 2 (class 3079 OID 16796)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 276 (class 1255 OID 17186)
-- Name: fn_actualizar_banda_mora(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_actualizar_banda_mora() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_fecha_vencimiento DATE;
BEGIN
    -- Obtener fecha de vencimiento del préstamo
    SELECT fecha_vencimiento INTO v_fecha_vencimiento 
    FROM prestamos WHERE id = NEW.prestamo_id;
    
    -- Calcular días de atraso
    IF v_fecha_vencimiento IS NOT NULL THEN
        NEW.dias_atraso := EXTRACT(DAY FROM (NOW() - v_fecha_vencimiento));
    END IF;
    
    -- Asignar banda según días de atraso
    IF NEW.dias_atraso <= 30 THEN
        NEW.banda := 'preventiva';
    ELSIF NEW.dias_atraso <= 60 THEN
        NEW.banda := 'temprana';
    ELSIF NEW.dias_atraso <= 90 THEN
        NEW.banda := 'tardia';
    ELSIF NEW.dias_atraso <= 120 THEN
        NEW.banda := 'judicial';
    ELSE
        NEW.banda := 'castigo';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_actualizar_banda_mora() OWNER TO postgres;

--
-- TOC entry 262 (class 1255 OID 17045)
-- Name: fn_generar_numero_cuenta(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_generar_numero_cuenta() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.numero_cuenta IS NULL OR NEW.numero_cuenta = '' THEN
        NEW.numero_cuenta := '00' || LPAD(FLOOR(RANDOM() * 999999999)::TEXT, 10, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_generar_numero_cuenta() OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 17047)
-- Name: fn_generar_referencia(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_generar_referencia() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.referencia IS NULL THEN
        NEW.referencia := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_generar_referencia() OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 17188)
-- Name: fn_update_solicitud_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_solicitud_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_solicitud_timestamp() OWNER TO postgres;

--
-- TOC entry 261 (class 1255 OID 17040)
-- Name: fn_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 244 (class 1259 OID 17539)
-- Name: cartera_mora; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cartera_mora (
    id integer NOT NULL,
    prestamo_id integer,
    usuario_id integer,
    dias_atraso integer DEFAULT 0,
    banda character varying(20),
    saldo_vencido numeric(15,2) DEFAULT 0,
    fecha_ultima_gestion timestamp without time zone,
    estado character varying(20) DEFAULT 'activa'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cartera_mora OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17538)
-- Name: cartera_mora_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cartera_mora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cartera_mora_id_seq OWNER TO postgres;

--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 243
-- Name: cartera_mora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cartera_mora_id_seq OWNED BY public.cartera_mora.id;


--
-- TOC entry 250 (class 1259 OID 17601)
-- Name: casos_prueba_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.casos_prueba_credito (
    id integer NOT NULL,
    caso_numero character varying(10) NOT NULL,
    cliente_nombre character varying(100),
    cliente_apellido character varying(100),
    monto numeric(15,2),
    plazo_meses integer,
    tea numeric(5,2),
    seguro_desgravamen boolean,
    fecha_desembolso date,
    fecha_primera_cuota date,
    cuota_esperada numeric(15,4),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.casos_prueba_credito OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 17600)
-- Name: casos_prueba_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.casos_prueba_credito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.casos_prueba_credito_id_seq OWNER TO postgres;

--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 249
-- Name: casos_prueba_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.casos_prueba_credito_id_seq OWNED BY public.casos_prueba_credito.id;


--
-- TOC entry 228 (class 1259 OID 17351)
-- Name: cuentas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas (
    id integer NOT NULL,
    usuario_id integer,
    numero_cuenta character varying(20) NOT NULL,
    tipo character varying(20) NOT NULL,
    moneda character varying(3) DEFAULT 'PEN'::character varying,
    saldo numeric(15,2) DEFAULT 0,
    saldo_disponible numeric(15,2) DEFAULT 0,
    estado character varying(20) DEFAULT 'activa'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cuentas OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17350)
-- Name: cuentas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuentas_id_seq OWNER TO postgres;

--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 227
-- Name: cuentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_id_seq OWNED BY public.cuentas.id;


--
-- TOC entry 240 (class 1259 OID 17489)
-- Name: cuotas_prestamo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuotas_prestamo (
    id integer NOT NULL,
    prestamo_id integer,
    numero_cuota integer NOT NULL,
    monto_cuota numeric(15,2) NOT NULL,
    monto_capital numeric(15,2) NOT NULL,
    monto_interes numeric(15,2) NOT NULL,
    fecha_vencimiento date NOT NULL,
    fecha_pago date,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cuotas_prestamo OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17488)
-- Name: cuotas_prestamo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuotas_prestamo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuotas_prestamo_id_seq OWNER TO postgres;

--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 239
-- Name: cuotas_prestamo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuotas_prestamo_id_seq OWNED BY public.cuotas_prestamo.id;


--
-- TOC entry 236 (class 1259 OID 17439)
-- Name: dictamen_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dictamen_credito (
    id integer NOT NULL,
    solicitud_id integer,
    nivel_aprobacion character varying(30),
    usuario_aprobador_id integer,
    monto_aprobado numeric(15,2),
    tasa_interes_aprobada numeric(5,2),
    plazo_aprobado integer,
    observaciones text,
    estado character varying(20),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.dictamen_credito OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17438)
-- Name: dictamen_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dictamen_credito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dictamen_credito_id_seq OWNER TO postgres;

--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 235
-- Name: dictamen_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dictamen_credito_id_seq OWNED BY public.dictamen_credito.id;


--
-- TOC entry 234 (class 1259 OID 17423)
-- Name: evaluacion_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_credito (
    id integer NOT NULL,
    solicitud_id integer,
    puntaje_scoring integer,
    elegibilidad boolean,
    razon_rechazo text,
    ingreso_mensual numeric(15,2),
    deuda_mensual numeric(15,2),
    rds numeric(5,2),
    nivel_riesgo character varying(20),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.evaluacion_credito OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17422)
-- Name: evaluacion_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluacion_credito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluacion_credito_id_seq OWNER TO postgres;

--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 233
-- Name: evaluacion_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluacion_credito_id_seq OWNED BY public.evaluacion_credito.id;


--
-- TOC entry 246 (class 1259 OID 17561)
-- Name: gestiones_cobranza; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gestiones_cobranza (
    id integer NOT NULL,
    cartera_mora_id integer,
    usuario_gestor_id integer,
    tipo_gestion character varying(30),
    resultado character varying(30),
    descripcion text,
    fecha_programada date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.gestiones_cobranza OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17560)
-- Name: gestiones_cobranza_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gestiones_cobranza_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gestiones_cobranza_id_seq OWNER TO postgres;

--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 245
-- Name: gestiones_cobranza_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gestiones_cobranza_id_seq OWNED BY public.gestiones_cobranza.id;


--
-- TOC entry 226 (class 1259 OID 17335)
-- Name: historial_acceso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_acceso (
    id integer NOT NULL,
    usuario_id integer,
    ip_address character varying(45),
    user_agent text,
    tipo_acceso character varying(20),
    fecha_acceso timestamp without time zone DEFAULT now()
);


ALTER TABLE public.historial_acceso OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17334)
-- Name: historial_acceso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_acceso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_acceso_id_seq OWNER TO postgres;

--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 225
-- Name: historial_acceso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_acceso_id_seq OWNED BY public.historial_acceso.id;


--
-- TOC entry 248 (class 1259 OID 17582)
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    id integer NOT NULL,
    usuario_id integer,
    titulo character varying(100) NOT NULL,
    mensaje text NOT NULL,
    tipo character varying(30),
    leida boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 17581)
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 247
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- TOC entry 238 (class 1259 OID 17460)
-- Name: prestamos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamos (
    id integer NOT NULL,
    usuario_id integer,
    cuenta_id integer,
    solicitud_id integer,
    monto_solicitado numeric(15,2),
    monto_aprobado numeric(15,2) DEFAULT 0,
    tasa_interes numeric(5,2) NOT NULL,
    plazo_meses integer NOT NULL,
    cuota_mensual numeric(15,2),
    saldo_pendiente numeric(15,2),
    tipo character varying(30),
    estado character varying(30) DEFAULT 'desembolsado'::character varying,
    seguro_desgravamen boolean DEFAULT false,
    fecha_primera_cuota date,
    tipo_cliente character varying(30),
    fecha_aprobacion timestamp without time zone,
    fecha_desembolso timestamp without time zone,
    fecha_vencimiento date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prestamos OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17459)
-- Name: prestamos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prestamos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prestamos_id_seq OWNER TO postgres;

--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 237
-- Name: prestamos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prestamos_id_seq OWNED BY public.prestamos.id;


--
-- TOC entry 220 (class 1259 OID 17013)
-- Name: sesiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesiones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    usuario_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    ip character varying(45),
    user_agent text,
    activa boolean DEFAULT true,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sesiones OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17402)
-- Name: solicitudes_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes_credito (
    id integer NOT NULL,
    usuario_id integer,
    monto_solicitado numeric(15,2) NOT NULL,
    tipo character varying(30) NOT NULL,
    plazo_meses integer NOT NULL,
    tea numeric(5,2) DEFAULT 43.92,
    seguro_desgravamen boolean DEFAULT false,
    fecha_primera_cuota date,
    tipo_cliente character varying(30) DEFAULT 'microempresa'::character varying,
    cliente_nombre character varying(100),
    cliente_apellido character varying(100),
    estado character varying(30) DEFAULT 'pendiente'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.solicitudes_credito OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17401)
-- Name: solicitudes_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitudes_credito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitudes_credito_id_seq OWNER TO postgres;

--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 231
-- Name: solicitudes_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_credito_id_seq OWNED BY public.solicitudes_credito.id;


--
-- TOC entry 222 (class 1259 OID 17278)
-- Name: tarjetas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarjetas (
    id integer NOT NULL,
    usuario_id integer,
    numero_tarjeta character varying(16) NOT NULL,
    tipo_tarjeta character varying(20) NOT NULL,
    fecha_vencimiento date NOT NULL,
    cvv character varying(4) NOT NULL,
    limite_diario numeric(15,2),
    estado character varying(20) DEFAULT 'activa'::character varying,
    fecha_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tarjetas OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17373)
-- Name: tarjetas_cmr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarjetas_cmr (
    id integer NOT NULL,
    usuario_id integer,
    cuenta_id integer,
    numero_tarjeta character varying(16) NOT NULL,
    numero_enmascarado character varying(19) NOT NULL,
    cvv_hash character varying(255) NOT NULL,
    fecha_expiracion date NOT NULL,
    linea_credito numeric(15,2) DEFAULT 2000,
    saldo_utilizado numeric(15,2) DEFAULT 0,
    tasa_interes numeric(5,2) DEFAULT 3.99,
    fecha_cierre date,
    fecha_vencimiento date,
    estado character varying(20) DEFAULT 'activa'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tarjetas_cmr OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17372)
-- Name: tarjetas_cmr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarjetas_cmr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarjetas_cmr_id_seq OWNER TO postgres;

--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 229
-- Name: tarjetas_cmr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarjetas_cmr_id_seq OWNED BY public.tarjetas_cmr.id;


--
-- TOC entry 221 (class 1259 OID 17277)
-- Name: tarjetas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarjetas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarjetas_id_seq OWNER TO postgres;

--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 221
-- Name: tarjetas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarjetas_id_seq OWNED BY public.tarjetas.id;


--
-- TOC entry 242 (class 1259 OID 17509)
-- Name: transacciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transacciones (
    id integer NOT NULL,
    cuenta_origen_id integer,
    cuenta_destino_id integer,
    tarjeta_id integer,
    tipo character varying(30) NOT NULL,
    monto numeric(15,2) NOT NULL,
    moneda character varying(3) DEFAULT 'PEN'::character varying,
    descripcion text,
    referencia character varying(50),
    estado character varying(20) DEFAULT 'completada'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transacciones OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17508)
-- Name: transacciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transacciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transacciones_id_seq OWNER TO postgres;

--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 241
-- Name: transacciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transacciones_id_seq OWNED BY public.transacciones.id;


--
-- TOC entry 224 (class 1259 OID 17316)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    "contraseña" character varying(255) NOT NULL,
    telefono character varying(20),
    fecha_nacimiento date,
    tipo_usuario character varying(30) DEFAULT 'cliente'::character varying,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT now(),
    fecha_actualizacion timestamp without time zone,
    dni character varying(20),
    estado character varying(20) DEFAULT 'activo'::character varying
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17315)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4993 (class 2604 OID 17542)
-- Name: cartera_mora id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartera_mora ALTER COLUMN id SET DEFAULT nextval('public.cartera_mora_id_seq'::regclass);


--
-- TOC entry 5003 (class 2604 OID 17604)
-- Name: casos_prueba_credito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casos_prueba_credito ALTER COLUMN id SET DEFAULT nextval('public.casos_prueba_credito_id_seq'::regclass);


--
-- TOC entry 4959 (class 2604 OID 17354)
-- Name: cuentas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas ALTER COLUMN id SET DEFAULT nextval('public.cuentas_id_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 17492)
-- Name: cuotas_prestamo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuotas_prestamo ALTER COLUMN id SET DEFAULT nextval('public.cuotas_prestamo_id_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 17442)
-- Name: dictamen_credito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictamen_credito ALTER COLUMN id SET DEFAULT nextval('public.dictamen_credito_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 17426)
-- Name: evaluacion_credito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_credito ALTER COLUMN id SET DEFAULT nextval('public.evaluacion_credito_id_seq'::regclass);


--
-- TOC entry 4998 (class 2604 OID 17564)
-- Name: gestiones_cobranza id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestiones_cobranza ALTER COLUMN id SET DEFAULT nextval('public.gestiones_cobranza_id_seq'::regclass);


--
-- TOC entry 4957 (class 2604 OID 17338)
-- Name: historial_acceso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso ALTER COLUMN id SET DEFAULT nextval('public.historial_acceso_id_seq'::regclass);


--
-- TOC entry 5000 (class 2604 OID 17585)
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- TOC entry 4981 (class 2604 OID 17463)
-- Name: prestamos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos ALTER COLUMN id SET DEFAULT nextval('public.prestamos_id_seq'::regclass);


--
-- TOC entry 4971 (class 2604 OID 17405)
-- Name: solicitudes_credito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_credito ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_credito_id_seq'::regclass);


--
-- TOC entry 4949 (class 2604 OID 17281)
-- Name: tarjetas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas ALTER COLUMN id SET DEFAULT nextval('public.tarjetas_id_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 17376)
-- Name: tarjetas_cmr id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_cmr ALTER COLUMN id SET DEFAULT nextval('public.tarjetas_cmr_id_seq'::regclass);


--
-- TOC entry 4989 (class 2604 OID 17512)
-- Name: transacciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones ALTER COLUMN id SET DEFAULT nextval('public.transacciones_id_seq'::regclass);


--
-- TOC entry 4952 (class 2604 OID 17319)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5239 (class 0 OID 17539)
-- Dependencies: 244
-- Data for Name: cartera_mora; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cartera_mora (id, prestamo_id, usuario_id, dias_atraso, banda, saldo_vencido, fecha_ultima_gestion, estado, created_at) FROM stdin;
1	5	10	0	\N	0.00	\N	activa	2026-06-24 19:07:18.509521
\.


--
-- TOC entry 5245 (class 0 OID 17601)
-- Dependencies: 250
-- Data for Name: casos_prueba_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.casos_prueba_credito (id, caso_numero, cliente_nombre, cliente_apellido, monto, plazo_meses, tea, seguro_desgravamen, fecha_desembolso, fecha_primera_cuota, cuota_esperada, created_at) FROM stdin;
1	CASO-001	Castor	Pérez	1000.00	12	43.92	f	2026-02-02	2026-03-03	100.9500	2026-06-23 00:57:01.351684
2	CASO-002	Eneida	Mamani	3000.00	12	40.92	t	2026-02-05	2026-03-05	299.5900	2026-06-23 00:57:01.351684
3	CASO-003	Ovidio	Torres	5000.00	18	43.92	f	2026-02-10	2026-03-10	366.0200	2026-06-23 00:57:01.351684
4	CASO-004	Dante	Flores	8000.00	6	43.92	f	2026-02-15	2026-03-15	1480.7300	2026-06-23 00:57:01.351684
5	CASO-005	Laura	Mendoza	10000.00	12	43.92	f	2026-03-01	2026-04-03	1009.4600	2026-06-23 00:57:01.351684
6	CASO-006	Boccaccio	Vargas	12000.00	24	40.92	t	2026-03-05	2026-04-05	700.9400	2026-06-23 00:57:01.351684
7	CASO-007	Orlando	Ríos	15000.00	18	43.92	f	2026-03-10	2026-04-10	1098.0700	2026-06-23 00:57:01.351684
8	CASO-008	Gerusalemme	Huanca	18000.00	24	43.92	f	2026-03-15	2026-04-15	1072.1000	2026-06-23 00:57:01.351684
9	CASO-009	Pedro	Calderón	20000.00	36	43.92	f	2026-04-02	2026-05-03	927.1200	2026-06-23 00:57:01.351684
10	CASO-010	Félix	Chávez	25000.00	24	40.92	t	2026-04-05	2026-05-05	1460.2900	2026-06-23 00:57:01.351684
11	CASO-011	Hildegarda	Huanca	2000.00	12	43.92	f	2026-04-10	2026-05-10	201.8900	2026-06-23 00:57:01.351684
12	CASO-012	Stendhal	Aguilar	4000.00	18	43.92	f	2026-04-15	2026-05-15	292.8200	2026-06-23 00:57:01.351684
13	CASO-013	Kipling	Soto	6000.00	12	40.92	t	2026-05-02	2026-06-03	599.1700	2026-06-23 00:57:01.351684
14	CASO-014	Erinná	Espinoza	7500.00	6	43.92	f	2026-05-05	2026-06-05	1388.1800	2026-06-23 00:57:01.351684
15	CASO-015	Annie	Espinoza	9000.00	24	43.92	f	2026-05-10	2026-06-10	536.0500	2026-06-23 00:57:01.351684
16	CASO-016	Homero	Quispe	11000.00	18	40.92	t	2026-05-15	2026-06-15	793.0300	2026-06-23 00:57:01.351684
17	CASO-017	Virgilio	Mamani	13500.00	12	43.92	f	2026-06-02	2026-07-03	1362.7700	2026-06-23 00:57:01.351684
18	CASO-018	Ovidio	Torres	16000.00	36	43.92	f	2026-06-05	2026-07-05	741.7000	2026-06-23 00:57:01.351684
19	CASO-019	Dante	Flores	17000.00	24	40.92	t	2026-06-10	2026-07-10	993.0000	2026-06-23 00:57:01.351684
20	CASO-020	Laura	Mendoza	19000.00	18	43.92	f	2026-06-15	2026-07-15	1390.8900	2026-06-23 00:57:01.351684
21	CASO-021	Boccaccio	Vargas	22000.00	36	43.92	f	2026-07-02	2026-08-03	1019.8300	2026-06-23 00:57:01.351684
22	CASO-022	Orlando	Ríos	24000.00	24	40.92	t	2026-07-05	2026-08-05	1401.8800	2026-06-23 00:57:01.351684
23	CASO-023	Gerusalemme	Huanca	1500.00	6	43.92	f	2026-07-10	2026-08-10	277.6400	2026-06-23 00:57:01.351684
24	CASO-024	Pedro	Calderón	3500.00	12	43.92	f	2026-07-15	2026-08-15	353.3100	2026-06-23 00:57:01.351684
25	CASO-025	Félix	Chávez	5500.00	18	40.92	t	2026-08-02	2026-09-03	396.5200	2026-06-23 00:57:01.351684
26	CASO-026	Hildegarda	Huanca	7000.00	24	43.92	f	2026-08-05	2026-09-05	416.9300	2026-06-23 00:57:01.351684
27	CASO-027	Stendhal	Aguilar	8500.00	12	43.92	f	2026-08-10	2026-09-10	858.0400	2026-06-23 00:57:01.351684
28	CASO-028	Kipling	Soto	10500.00	36	40.92	t	2026-08-15	2026-09-15	473.7700	2026-06-23 00:57:01.351684
29	CASO-029	Erinná	Espinoza	14000.00	18	43.92	f	2026-09-02	2026-10-03	1024.8700	2026-06-23 00:57:01.351684
30	CASO-030	Annie	Espinoza	30000.00	24	43.92	f	2026-09-05	2026-10-05	1786.8300	2026-06-23 00:57:01.351684
\.


--
-- TOC entry 5223 (class 0 OID 17351)
-- Dependencies: 228
-- Data for Name: cuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas (id, usuario_id, numero_cuenta, tipo, moneda, saldo, saldo_disponible, estado, created_at) FROM stdin;
1	1	0012345678901	ahorro	PEN	15000.00	15000.00	activa	2026-06-23 00:56:08.91494
2	1	0012345678902	corriente	PEN	2500.00	2500.00	activa	2026-06-23 00:56:08.91494
3	2	0012345678903	ahorro	PEN	8000.00	8000.00	activa	2026-06-23 00:56:08.91494
4	2	0012345678904	cmr	PEN	0.00	0.00	activa	2026-06-23 00:56:08.91494
5	3	0012345678905	ahorro	PEN	50000.00	50000.00	activa	2026-06-23 00:56:08.91494
6	4	0012345678906	ahorro	PEN	35000.00	35000.00	activa	2026-06-23 00:56:08.91494
7	7	0012345678907	ahorro	PEN	50000.00	50000.00	activa	2026-06-23 01:40:38.308714
8	7	0012345678908	corriente	PEN	15000.00	15000.00	activa	2026-06-23 01:40:38.308714
9	7	0012345678909	cmr	PEN	0.00	0.00	activa	2026-06-23 01:40:38.308714
12	10	00123456700102	corriente	PEN	1300.00	0.00	activa	2026-06-24 18:43:21.309347
13	5	00123456700201	ahorro	PEN	6000.00	0.00	activa	2026-06-24 18:43:21.309347
14	5	00123456700202	corriente	PEN	1600.00	0.00	activa	2026-06-24 18:43:21.309347
15	8	00123456700301	ahorro	PEN	6500.00	0.00	activa	2026-06-24 18:43:21.309347
16	8	00123456700302	corriente	PEN	1900.00	0.00	activa	2026-06-24 18:43:21.309347
17	6	00123456700401	ahorro	PEN	7000.00	0.00	activa	2026-06-24 18:43:21.309347
18	6	00123456700402	corriente	PEN	2200.00	0.00	activa	2026-06-24 18:43:21.309347
19	9	00123456700501	ahorro	PEN	7500.00	0.00	activa	2026-06-24 18:43:21.309347
20	9	00123456700502	corriente	PEN	2500.00	0.00	activa	2026-06-24 18:43:21.309347
11	10	00123456700101	ahorro	PEN	37500.00	0.00	activa	2026-06-24 18:43:21.309347
\.


--
-- TOC entry 5235 (class 0 OID 17489)
-- Dependencies: 240
-- Data for Name: cuotas_prestamo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuotas_prestamo (id, prestamo_id, numero_cuota, monto_cuota, monto_capital, monto_interes, fecha_vencimiento, fecha_pago, estado, created_at) FROM stdin;
1	3	1	1134.72	894.72	240.00	2026-07-24	\N	pendiente	2026-06-24 18:44:38.029819
2	3	2	1134.72	912.61	222.11	2026-08-24	\N	pendiente	2026-06-24 18:44:38.029819
3	3	3	1134.72	930.87	203.85	2026-09-24	\N	pendiente	2026-06-24 18:44:38.029819
4	3	4	1134.72	949.48	185.24	2026-10-24	\N	pendiente	2026-06-24 18:44:38.029819
5	3	5	1134.72	968.47	166.25	2026-11-24	\N	pendiente	2026-06-24 18:44:38.029819
6	3	6	1134.72	987.84	146.88	2026-12-24	\N	pendiente	2026-06-24 18:44:38.029819
7	3	7	1134.72	1007.60	127.12	2027-01-24	\N	pendiente	2026-06-24 18:44:38.029819
8	3	8	1134.72	1027.75	106.97	2027-02-24	\N	pendiente	2026-06-24 18:44:38.029819
9	3	9	1134.72	1048.31	86.41	2027-03-24	\N	pendiente	2026-06-24 18:44:38.029819
10	3	10	1134.72	1069.27	65.45	2027-04-24	\N	pendiente	2026-06-24 18:44:38.029819
11	3	11	1134.72	1090.66	44.06	2027-05-24	\N	pendiente	2026-06-24 18:44:38.029819
12	3	12	1134.72	1112.47	22.25	2027-06-24	\N	pendiente	2026-06-24 18:44:38.029819
13	5	1	1464.10	847.99	616.11	2026-06-24	\N	pendiente	2026-06-24 19:07:18.509521
14	5	2	1464.10	874.11	589.99	2026-07-24	\N	pendiente	2026-06-24 19:07:18.509521
15	5	3	1464.10	901.04	563.06	2026-08-24	\N	pendiente	2026-06-24 19:07:18.509521
16	5	4	1464.10	928.80	535.30	2026-09-24	\N	pendiente	2026-06-24 19:07:18.509521
17	5	5	1464.10	957.41	506.69	2026-10-24	\N	pendiente	2026-06-24 19:07:18.509521
18	5	6	1464.10	986.90	477.20	2026-11-24	\N	pendiente	2026-06-24 19:07:18.509521
19	5	7	1464.10	1017.30	446.80	2026-12-24	\N	pendiente	2026-06-24 19:07:18.509521
20	5	8	1464.10	1048.64	415.46	2027-01-24	\N	pendiente	2026-06-24 19:07:18.509521
21	5	9	1464.10	1080.95	383.15	2027-02-24	\N	pendiente	2026-06-24 19:07:18.509521
22	5	10	1464.10	1114.25	349.85	2027-03-24	\N	pendiente	2026-06-24 19:07:18.509521
23	5	11	1464.10	1148.57	315.53	2027-04-24	\N	pendiente	2026-06-24 19:07:18.509521
24	5	12	1464.10	1183.95	280.15	2027-05-24	\N	pendiente	2026-06-24 19:07:18.509521
25	5	13	1464.10	1220.42	243.68	2027-06-24	\N	pendiente	2026-06-24 19:07:18.509521
26	5	14	1464.10	1258.02	206.08	2027-07-24	\N	pendiente	2026-06-24 19:07:18.509521
27	5	15	1464.10	1296.77	167.33	2027-08-24	\N	pendiente	2026-06-24 19:07:18.509521
28	5	16	1464.10	1336.72	127.38	2027-09-24	\N	pendiente	2026-06-24 19:07:18.509521
29	5	17	1464.10	1377.90	86.20	2027-10-24	\N	pendiente	2026-06-24 19:07:18.509521
30	5	18	1464.10	1420.35	43.75	2027-11-24	\N	pendiente	2026-06-24 19:07:18.509521
\.


--
-- TOC entry 5231 (class 0 OID 17439)
-- Dependencies: 236
-- Data for Name: dictamen_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dictamen_credito (id, solicitud_id, nivel_aprobacion, usuario_aprobador_id, monto_aprobado, tasa_interes_aprobada, plazo_aprobado, observaciones, estado, created_at) FROM stdin;
1	1	jefe_riesgos	7	20000.00	18.00	18		aprobado	2026-06-24 19:07:18.509521
\.


--
-- TOC entry 5229 (class 0 OID 17423)
-- Dependencies: 234
-- Data for Name: evaluacion_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluacion_credito (id, solicitud_id, puntaje_scoring, elegibilidad, razon_rechazo, ingreso_mensual, deuda_mensual, rds, nivel_riesgo, created_at) FROM stdin;
1	1	75	t	\N	2000.00	120.00	6.00	medio	2026-06-24 19:06:52.37091
\.


--
-- TOC entry 5241 (class 0 OID 17561)
-- Dependencies: 246
-- Data for Name: gestiones_cobranza; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gestiones_cobranza (id, cartera_mora_id, usuario_gestor_id, tipo_gestion, resultado, descripcion, fecha_programada, created_at) FROM stdin;
\.


--
-- TOC entry 5221 (class 0 OID 17335)
-- Dependencies: 226
-- Data for Name: historial_acceso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_acceso (id, usuario_id, ip_address, user_agent, tipo_acceso, fecha_acceso) FROM stdin;
1	7	::1	PostmanRuntime/7.54.0	login	2026-06-23 01:15:31.24801
2	7	::1	PostmanRuntime/7.54.0	login	2026-06-23 01:25:25.306407
3	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-23 01:38:59.206589
4	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-23 01:41:19.446804
5	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-23 01:42:34.518619
6	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-23 02:34:30.087648
7	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:27:45.885681
8	10	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:36:41.353847
9	8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:41:55.973903
10	10	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:44:14.842363
11	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:44:30.716897
12	10	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:45:01.916361
13	10	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 18:51:11.088833
14	10	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 19:02:16.644639
15	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 19:07:06.175857
16	10	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	login	2026-06-24 19:07:23.227446
\.


--
-- TOC entry 5243 (class 0 OID 17582)
-- Dependencies: 248
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificaciones (id, usuario_id, titulo, mensaje, tipo, leida, created_at) FROM stdin;
1	7	Solicitud de préstamo recibida	Tu solicitud de préstamo por S/ 1200 está en evaluación.	prestamo	f	2026-06-23 02:34:40.211854
2	10	Solicitud de préstamo recibida	Tu solicitud de préstamo por S/ 12000 está en evaluación.	prestamo	f	2026-06-24 18:44:25.598848
3	10	¡Préstamo aprobado!	Tu préstamo por S/ 12000 ha sido aprobado y desembolsado en tu cuenta.	prestamo	f	2026-06-24 18:44:38.029819
4	10	Solicitud de préstamo recibida	Tu solicitud de préstamo por S/ 1200 está en evaluación.	prestamo	f	2026-06-24 19:02:29.129755
5	10	Solicitud de crédito recibida	Tu solicitud de S/ 20000 está en evaluación. Cuota estimada: S/ 1464.10	prestamo	f	2026-06-24 19:06:52.37091
6	10	¡Crédito aprobado!	Tu crédito por S/ 20000 ha sido aprobado y desembolsado. Cuota mensual: S/ 1464.1	prestamo	f	2026-06-24 19:07:18.509521
\.


--
-- TOC entry 5233 (class 0 OID 17460)
-- Dependencies: 238
-- Data for Name: prestamos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamos (id, usuario_id, cuenta_id, solicitud_id, monto_solicitado, monto_aprobado, tasa_interes, plazo_meses, cuota_mensual, saldo_pendiente, tipo, estado, seguro_desgravamen, fecha_primera_cuota, tipo_cliente, fecha_aprobacion, fecha_desembolso, fecha_vencimiento, created_at) FROM stdin;
2	7	7	\N	1200.00	0.00	18.00	12	110.02	\N	personal	pendiente	f	\N	\N	\N	\N	\N	2026-06-23 02:34:40.171578
3	10	11	\N	12000.00	12000.00	24.00	12	1134.72	12000.00	consumo	desembolsado	f	\N	\N	2026-06-24 18:44:38.029819	2026-06-24 18:44:38.029819	2027-06-24	2026-06-24 18:44:25.550344
4	10	11	\N	1200.00	0.00	24.00	18	80.04	\N	consumo	pendiente	f	\N	\N	\N	\N	\N	2026-06-24 19:02:29.125231
5	10	11	\N	20000.00	20000.00	43.92	18	1464.10	20000.00	consumo	desembolsado	f	\N	microempresa	2026-06-24 19:07:18.509521	2026-06-24 19:07:18.509521	2027-12-24	2026-06-24 19:07:18.509521
\.


--
-- TOC entry 5215 (class 0 OID 17013)
-- Dependencies: 220
-- Data for Name: sesiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sesiones (id, usuario_id, token_hash, ip, user_agent, activa, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5227 (class 0 OID 17402)
-- Dependencies: 232
-- Data for Name: solicitudes_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_credito (id, usuario_id, monto_solicitado, tipo, plazo_meses, tea, seguro_desgravamen, fecha_primera_cuota, tipo_cliente, cliente_nombre, cliente_apellido, estado, created_at) FROM stdin;
1	10	20000.00	consumo	18	43.92	f	\N	microempresa	\N	\N	aprobado	2026-06-24 19:06:52.37091
\.


--
-- TOC entry 5217 (class 0 OID 17278)
-- Dependencies: 222
-- Data for Name: tarjetas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarjetas (id, usuario_id, numero_tarjeta, tipo_tarjeta, fecha_vencimiento, cvv, limite_diario, estado, fecha_emision) FROM stdin;
\.


--
-- TOC entry 5225 (class 0 OID 17373)
-- Dependencies: 230
-- Data for Name: tarjetas_cmr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarjetas_cmr (id, usuario_id, cuenta_id, numero_tarjeta, numero_enmascarado, cvv_hash, fecha_expiracion, linea_credito, saldo_utilizado, tasa_interes, fecha_cierre, fecha_vencimiento, estado, created_at) FROM stdin;
1	7	9	4111111111111111	**** **** **** 1111	$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv	2028-12-31	5000.00	0.00	3.99	\N	\N	activa	2026-06-23 01:43:03.991931
\.


--
-- TOC entry 5237 (class 0 OID 17509)
-- Dependencies: 242
-- Data for Name: transacciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transacciones (id, cuenta_origen_id, cuenta_destino_id, tarjeta_id, tipo, monto, moneda, descripcion, referencia, estado, created_at) FROM stdin;
1	\N	11	\N	abono	12000.00	PEN	Desembolso de préstamo	\N	completada	2026-06-24 18:44:38.029819
2	\N	11	\N	abono	20000.00	PEN	Desembolso de crédito aprobado	\N	completada	2026-06-24 19:07:18.509521
\.


--
-- TOC entry 5219 (class 0 OID 17316)
-- Dependencies: 224
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, apellido, email, "contraseña", telefono, fecha_nacimiento, tipo_usuario, activo, fecha_creacion, fecha_actualizacion, dni, estado) FROM stdin;
1	Carlos	González	cliente@bancofalabella.pe	$2a$10$R1p4LGt4p4LGt4p4LGt4pO6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1	999111222	1990-01-15	cliente	t	2026-06-23 00:56:00.145868	\N	\N	activo
2	Ana	Martínez	cliente2@bancofalabella.pe	$2a$10$R1p4LGt4p4LGt4p4LGt4pO6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1	999333444	1985-06-20	cliente	t	2026-06-23 00:56:00.145868	\N	\N	activo
3	Admin	Falabella	admin@bancofalabella.pe	$2a$10$R1p4LGt4p4LGt4p4LGt4pO6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1	999555666	1980-03-10	admin	t	2026-06-23 00:56:00.145868	\N	\N	activo
4	Jefe	Riesgos	jefe.riesgos@bancofalabella.pe	$2a$10$R1p4LGt4p4LGt4p4LGt4pO6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1	999777888	1975-08-25	jefe_riesgos	t	2026-06-23 00:56:00.145868	\N	\N	activo
5	Comite	Credito	comite@bancofalabella.pe	$2a$10$R1p4LGt4p4LGt4p4LGt4pO6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1	999999000	1978-11-05	comite	t	2026-06-23 00:56:00.145868	\N	\N	activo
6	Gerencia	General	gerencia@bancofalabella.pe	$2a$10$R1p4LGt4p4LGt4p4LGt4pO6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1	999000111	1970-04-15	gerencia	t	2026-06-23 00:56:00.145868	\N	\N	activo
7	Admin	Falabella	admin2@bancofalabella.pe	$2b$10$JimulEcb/iHwjYGkIUh1fOgHLUzW71vUA5JVCQyW1lDRBmnfntnHO	999555666	1980-03-10	admin	t	2026-06-23 01:14:19.881657	\N	\N	activo
8	carlos	vd	cl@gmail.com	$2b$10$mk5Ko1YHQt25571dxud0zuQiS.8VKahs60ZmU/gfXEKqraePGssU.	938231232	2009-01-23	cliente	t	2026-06-23 02:00:11.930022	\N	\N	activo
9	smith	sm	sm@gmail.com	$2b$10$jEw0jyz5tlCc82li8Mx7we.UM.mRwf/IYtD8LA7XSKZ/PIFBtG9fy	964653626	1999-03-12	cliente	t	2026-06-23 02:05:20.161522	\N	32746373	activo
10	Eliam	CV	E@gmail.com	$2b$10$eKsR9pBeOXOkShUkXydlbeTs7ZeiAgMf9ck/zKr2QsBkcFF/s4I0i	978347465	2007-01-23	cliente	t	2026-06-24 18:35:36.808833	\N	64636838	activo
\.


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 243
-- Name: cartera_mora_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cartera_mora_id_seq', 1, true);


--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 249
-- Name: casos_prueba_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.casos_prueba_credito_id_seq', 30, true);


--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 227
-- Name: cuentas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_id_seq', 20, true);


--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 239
-- Name: cuotas_prestamo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuotas_prestamo_id_seq', 30, true);


--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 235
-- Name: dictamen_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dictamen_credito_id_seq', 1, true);


--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 233
-- Name: evaluacion_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluacion_credito_id_seq', 1, true);


--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 245
-- Name: gestiones_cobranza_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gestiones_cobranza_id_seq', 1, false);


--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 225
-- Name: historial_acceso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_acceso_id_seq', 16, true);


--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 247
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 6, true);


--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 237
-- Name: prestamos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_id_seq', 5, true);


--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 231
-- Name: solicitudes_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_credito_id_seq', 1, true);


--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 229
-- Name: tarjetas_cmr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarjetas_cmr_id_seq', 1, true);


--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 221
-- Name: tarjetas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarjetas_id_seq', 1, false);


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 241
-- Name: transacciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transacciones_id_seq', 2, true);


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 10, true);


--
-- TOC entry 5039 (class 2606 OID 17549)
-- Name: cartera_mora cartera_mora_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartera_mora
    ADD CONSTRAINT cartera_mora_pkey PRIMARY KEY (id);


--
-- TOC entry 5045 (class 2606 OID 17611)
-- Name: casos_prueba_credito casos_prueba_credito_caso_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casos_prueba_credito
    ADD CONSTRAINT casos_prueba_credito_caso_numero_key UNIQUE (caso_numero);


--
-- TOC entry 5047 (class 2606 OID 17609)
-- Name: casos_prueba_credito casos_prueba_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casos_prueba_credito
    ADD CONSTRAINT casos_prueba_credito_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 17366)
-- Name: cuentas cuentas_numero_cuenta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_numero_cuenta_key UNIQUE (numero_cuenta);


--
-- TOC entry 5021 (class 2606 OID 17364)
-- Name: cuentas cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 17502)
-- Name: cuotas_prestamo cuotas_prestamo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuotas_prestamo
    ADD CONSTRAINT cuotas_prestamo_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 17448)
-- Name: dictamen_credito dictamen_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictamen_credito
    ADD CONSTRAINT dictamen_credito_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 17432)
-- Name: evaluacion_credito evaluacion_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_credito
    ADD CONSTRAINT evaluacion_credito_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 17570)
-- Name: gestiones_cobranza gestiones_cobranza_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestiones_cobranza
    ADD CONSTRAINT gestiones_cobranza_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 17344)
-- Name: historial_acceso historial_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso
    ADD CONSTRAINT historial_acceso_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 17594)
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5033 (class 2606 OID 17472)
-- Name: prestamos prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 17026)
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 17416)
-- Name: solicitudes_credito solicitudes_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_credito
    ADD CONSTRAINT solicitudes_credito_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 17390)
-- Name: tarjetas_cmr tarjetas_cmr_numero_tarjeta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_cmr
    ADD CONSTRAINT tarjetas_cmr_numero_tarjeta_key UNIQUE (numero_tarjeta);


--
-- TOC entry 5025 (class 2606 OID 17388)
-- Name: tarjetas_cmr tarjetas_cmr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_cmr
    ADD CONSTRAINT tarjetas_cmr_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 17292)
-- Name: tarjetas tarjetas_numero_tarjeta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas
    ADD CONSTRAINT tarjetas_numero_tarjeta_key UNIQUE (numero_tarjeta);


--
-- TOC entry 5011 (class 2606 OID 17290)
-- Name: tarjetas tarjetas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas
    ADD CONSTRAINT tarjetas_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 17522)
-- Name: transacciones transacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones
    ADD CONSTRAINT transacciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 17333)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 5015 (class 2606 OID 17331)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 1259 OID 17039)
-- Name: idx_sesiones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sesiones_usuario ON public.sesiones USING btree (usuario_id, activa);


--
-- TOC entry 5063 (class 2606 OID 17550)
-- Name: cartera_mora cartera_mora_prestamo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartera_mora
    ADD CONSTRAINT cartera_mora_prestamo_id_fkey FOREIGN KEY (prestamo_id) REFERENCES public.prestamos(id);


--
-- TOC entry 5064 (class 2606 OID 17555)
-- Name: cartera_mora cartera_mora_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartera_mora
    ADD CONSTRAINT cartera_mora_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5049 (class 2606 OID 17367)
-- Name: cuentas cuentas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5059 (class 2606 OID 17503)
-- Name: cuotas_prestamo cuotas_prestamo_prestamo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuotas_prestamo
    ADD CONSTRAINT cuotas_prestamo_prestamo_id_fkey FOREIGN KEY (prestamo_id) REFERENCES public.prestamos(id);


--
-- TOC entry 5054 (class 2606 OID 17449)
-- Name: dictamen_credito dictamen_credito_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictamen_credito
    ADD CONSTRAINT dictamen_credito_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_credito(id);


--
-- TOC entry 5055 (class 2606 OID 17454)
-- Name: dictamen_credito dictamen_credito_usuario_aprobador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictamen_credito
    ADD CONSTRAINT dictamen_credito_usuario_aprobador_id_fkey FOREIGN KEY (usuario_aprobador_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5053 (class 2606 OID 17433)
-- Name: evaluacion_credito evaluacion_credito_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_credito
    ADD CONSTRAINT evaluacion_credito_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_credito(id);


--
-- TOC entry 5065 (class 2606 OID 17571)
-- Name: gestiones_cobranza gestiones_cobranza_cartera_mora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestiones_cobranza
    ADD CONSTRAINT gestiones_cobranza_cartera_mora_id_fkey FOREIGN KEY (cartera_mora_id) REFERENCES public.cartera_mora(id);


--
-- TOC entry 5066 (class 2606 OID 17576)
-- Name: gestiones_cobranza gestiones_cobranza_usuario_gestor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestiones_cobranza
    ADD CONSTRAINT gestiones_cobranza_usuario_gestor_id_fkey FOREIGN KEY (usuario_gestor_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5048 (class 2606 OID 17345)
-- Name: historial_acceso historial_acceso_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso
    ADD CONSTRAINT historial_acceso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5067 (class 2606 OID 17595)
-- Name: notificaciones notificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5056 (class 2606 OID 17478)
-- Name: prestamos prestamos_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.cuentas(id);


--
-- TOC entry 5057 (class 2606 OID 17483)
-- Name: prestamos prestamos_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_credito(id);


--
-- TOC entry 5058 (class 2606 OID 17473)
-- Name: prestamos prestamos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5052 (class 2606 OID 17417)
-- Name: solicitudes_credito solicitudes_credito_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_credito
    ADD CONSTRAINT solicitudes_credito_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5050 (class 2606 OID 17396)
-- Name: tarjetas_cmr tarjetas_cmr_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_cmr
    ADD CONSTRAINT tarjetas_cmr_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.cuentas(id);


--
-- TOC entry 5051 (class 2606 OID 17391)
-- Name: tarjetas_cmr tarjetas_cmr_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_cmr
    ADD CONSTRAINT tarjetas_cmr_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 5060 (class 2606 OID 17528)
-- Name: transacciones transacciones_cuenta_destino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones
    ADD CONSTRAINT transacciones_cuenta_destino_id_fkey FOREIGN KEY (cuenta_destino_id) REFERENCES public.cuentas(id);


--
-- TOC entry 5061 (class 2606 OID 17523)
-- Name: transacciones transacciones_cuenta_origen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones
    ADD CONSTRAINT transacciones_cuenta_origen_id_fkey FOREIGN KEY (cuenta_origen_id) REFERENCES public.cuentas(id);


--
-- TOC entry 5062 (class 2606 OID 17533)
-- Name: transacciones transacciones_tarjeta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones
    ADD CONSTRAINT transacciones_tarjeta_id_fkey FOREIGN KEY (tarjeta_id) REFERENCES public.tarjetas_cmr(id);


-- Completed on 2026-06-24 19:32:51

--
-- PostgreSQL database dump complete
--

\unrestrict zMwoJ8qFQueapbYDZdf5DgXTOGtOoraNO3zk20ZXYUftRjDiDZQhYflOKymjy6V

