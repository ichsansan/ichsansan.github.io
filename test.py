from flask import Flask, jsonify, request
from sqlalchemy import create_engine
from datetime import datetime

app = Flask(__name__)
app.secret_key = "CADB9E1BCFDCBA01ADB1038DCF"

@app.route('/savelog')
def index():
    data = dict(request.values)
    connection = "mysql+mysqlconnector://root:P%40ssw0rd@34.82.247.154:3307/db_data_log"

    try:
        with create_engine(connection).connect() as engine:
            q = f"""INSERT INTO tb_record_kunjungan (f_timestamp,f_endpoint,f_location,f_ip_address,f_user_agent,f_local_time,f_screen,f_lang_id)
                    VALUE (NOW(),"{data['endpoint']}","{data['location']}","{data['ip_address']}","{data['user_agent']}","{data['local_time']}","{data['screen']}","{data['lang_id']}") """
            engine.execute(q)
            q = f"""SELECT COUNT(*) FROM tb_record_kunjungan """
            jumlah_pengunjung = int(engine.execute(q).fetchall()[0][0])
            
            data['jumlah_pengunjung'] = jumlah_pengunjung
            data['update_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            return jsonify({"status": "success", "data": data})
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "data": f"Error: {str(e)}"})


app.run('0.0.0.0', port=5001, debug=False)