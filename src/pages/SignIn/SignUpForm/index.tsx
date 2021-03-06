import Box from "@material-ui/core/Box"
import * as React from "react"
import { Formik, Form, Field } from "formik"
import { Button, LinearProgress, Typography } from "@material-ui/core"
import { TextField } from "formik-material-ui"
import * as Yup from "yup"
import useStyles from "./styles"
import { useHistory } from "react-router-dom"
import { useAPICallback } from "hooks/useApiCallback"
import { authService, IAuthResponse } from "@jetkit/react"
import { UserContext } from "service/userContext/userContext"
import { ILoginResponse } from "model/loginResponse"

interface ICredentials {
  email: string
  password: string
}

const SignInSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(5, "Password should contain at least 5 characters")
    .max(20, "Password shouldn`t be longer than 20 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
})

interface ISignUpFormProps {
  setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SignUpForm({ setIsSignIn }: ISignUpFormProps) {
  const history = useHistory()
  const userContext = React.useContext(UserContext)
  const [isAuthFailed, setIsAuthFailed] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const handleSubmit = useAPICallback(
    async (values: ICredentials, actions: any) => {
      await authService.signUp(values.email, values.password)
      const data: ILoginResponse = await authService.login<IAuthResponse>(values.email, values.password)
      data.user && userContext.handleSettingUser({ user: { email: data.user.email, id: data.user.id } })
      actions.setSubmitting(false)
      history.push("/dashboard")
    },
    [history],
    {
      onError: (error: Error) => {
        if (error.message === "Request failed with status code 400") setErrorMessage("Such user exists")
        else setErrorMessage("Unknown server error")
        setIsAuthFailed(true)
      },
    }
  )

  const classes = useStyles()
  return (
    <>
      <Formik
        initialValues={{
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={SignInSchema}
        onSubmit={handleSubmit}
      >
        {({ submitForm, isSubmitting, errors, touched }) => (
          <Form className={classes.logInForm}>
            <Field
              className={classes.inputField}
              component={TextField}
              label={"Email"}
              name={"email"}
              data-cy={"email-signUp-field"}
            />
            <Field
              className={classes.inputField}
              component={TextField}
              label={"Password"}
              name={"password"}
              type={"password"}
              data-cy={"password-signUp-field"}
            />
            <Field
              className={classes.inputField}
              component={TextField}
              label={"Confirm password"}
              name={"confirmPassword"}
              type={"password"}
              data-cy={"confirm-password-signUp-field"}
            />
            {isSubmitting && <LinearProgress />}
            {isAuthFailed && (
              <Box data-cy={"failed-signUp"} className={classes.errorMessage}>
                {errorMessage}
              </Box>
            )}
            <Box className={classes.formControls}>
              <Button
                className={classes.mainButton}
                variant="contained"
                color="primary"
                data-cy={"signUp-button"}
                disabled={isSubmitting}
                onClick={submitForm}
              >
                Sign Up
              </Button>
              <Typography className={classes.orSign}>or</Typography>
              <Button
                type={"button"}
                classes={{
                  root: classes.secondaryButton,
                }}
                variant="contained"
                data-cy={"switch-to-signIn"}
                disabled={isSubmitting}
                onClick={() => setIsSignIn(true)}
              >
                Login
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  )
}
