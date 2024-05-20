import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const local = false;

export default function Index() {
  const [data, setData] = useState({});
  const [nome, setNome] = useState("RaphaelRamalho");
  const [date, setDate] = useState(new Date());
  const [strDate, setStrDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataGet, setDataGet] = useState(false);
  const [notif, setNotif] = useState(false);

  const handleClick = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const url = local
      ? "http://192.168.0.14:5000/getdata"
      : "https://mfp2.vercel.app/getdata";
    setLoading(true);

    console.log(url + "?userid=" + nome + "&date=" + strDate);
    try {
      fetch(url + "?userid=" + nome + "&date=" + strDate)
        .then((response) => response.json())
        .then((r) => {
          setData(r);
          setDataGet(true);
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const handleDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const showDate = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: handleDate,
      mode: "date",
    });
  };

  useEffect(() => {
    if (data.total_calories != undefined && notif)
      Notifications.scheduleNotificationAsync({
        content: {
          title: `${date.toUTCString()}`,
          body: `Calorias do dia: ${
            data?.total_calories
          }Kcal / ${data?.total_calories_needed?.replace(",", "")}Kcal`,
        },
        trigger: {
          seconds: 1,
        },
      });
  }, [data]);

  useEffect(() => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    console.log(`${ano}-${mes}-${dia}`);
    setStrDate(`${ano}-${mes}-${dia}`);
  }, [date]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 40,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Olá {nome}!</Text>
      <Text style={{ fontSize: 20, marginVertical: 10 }}>
        {date.toUTCString()}
      </Text>
      <TextInput
        placeholder="Nome de usuário do MFP"
        style={{
          borderColor: "black",
          borderWidth: 1,
          marginVertical: 10,
          paddingVertical: 10,
          paddingHorizontal: 25,
          fontSize: 24,
        }}
        value={nome}
        onChange={(value) => setNome(value.nativeEvent.text)}
      />
      <View style={{ flexDirection: "row", gap: 5 }}>
        <Button
          onPress={showDate}
          title="Selecione uma nova data"
          disabled={loading}
        />
        <Button
          onPress={() => handleClick()}
          title="Realizar consulta"
          disabled={loading}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <Button
          onPress={() => setNotif(!notif)}
          title={!notif ? "Suprimir notificações" : "Mostrar notificações"}
          disabled={loading}
          color={!notif ? "red" : "green"}
        />
      </View>

      {loading ? (
        <Text style={{ fontSize: 30, marginTop: 20 }}>Buscando dados...</Text>
      ) : null}

      {dataGet && !loading ? (
        <View style={{ flex: 1, alignItems: "center", marginTop: 20 }}>
          <Text style={{ fontSize: 30 }}>
            Calorias totais: {data?.total_calories_needed?.replace(",", "")}Kcal
          </Text>
          <Text style={{ fontSize: 30, color: "green" }}>
            Calorias consumidas: {data?.total_calories}Kcal
          </Text>
          <View>
            <ScrollView style={styles.container}>
              {data && data.total_calories > 0 ? (
                <>
                  <MealSection title="Café da manhã:" data={data.breakfast} />
                  <MealSection title="Almoço:" data={data.lunch} />
                  <MealSection title="Café da tarde:" data={data.snacks} />
                  <MealSection title="Jantar:" data={data.dinner} />
                </>
              ) : (
                <View style={styles.centeredContainer}>
                  <Text style={styles.errorText}>Ops!</Text>
                  <Text style={styles.errorText}>
                    Parece que não foi encontrado nenhum alimento esse dia...
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const MealSection = ({ title, data }) => {
  return (
    <View style={styles.mealContainer}>
      <Text style={styles.mealTitle}>
        {title} {data[data.length - 1].total_calories}Kcal
      </Text>
      {data.map((item) => {
        if (item && !item.hasOwnProperty("total_calories")) {
          return (
            <View key={item.item} style={styles.mealItem}>
              <Text style={styles.mealItemCalories}>{item.calories} Kcal</Text>
              <Text>{item.item}</Text>
            </View>
          );
        }
        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginBottom: 100,
    marginTop: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  mealContainer: {
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 4,
    paddingBottom: 5,
    marginBottom: 10,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  mealItemCalories: {
    marginRight: 10,
    fontWeight: "bold",
  },
});
